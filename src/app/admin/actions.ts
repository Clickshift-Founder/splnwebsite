"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { admins, cohorts, countries, galleryPhotos, graduates, nominations, posts, spotlights, stats } from "@/db/schema";
import { endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { importGraduatesCsv } from "@/lib/graduate-import";
import { notifyAuthor } from "@/lib/notify";
import { loadSamples, removeSamples } from "@/lib/samples";
import { deleteStored } from "@/lib/storage";
import { cleanName, normaliseEmail, slugify } from "@/lib/text";
import { adminPostSchema, fieldErrors, formToObject, profileSchema, spotlightSchema } from "@/lib/validation";
import type { ActionResult } from "@/components/ui/form";

const fail = (error: string, fe?: Record<string, string>): ActionResult => ({ ok: false, error, fieldErrors: fe });

function revalidatePublic() {
  for (const p of ["/", "/graduates", "/impact", "/spotlight", "/insights", "/join", "/gallery"]) revalidatePath(p);
}

/* ── Auth ─────────────────────────────────────────────────────────────── */

const loginAttempts = new Map<string, { n: number; at: number }>();
let dummyHash: string | null = null; // compared against when the account doesn't exist (constant-time-ish)

export async function adminLogin(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");

  // Soft in-memory throttle (per instance): 8 tries / 15 min per email.
  const rec = loginAttempts.get(email);
  if (rec && Date.now() - rec.at < 15 * 60_000 && rec.n >= 8) return fail("Too many attempts. Try again in 15 minutes.");

  const [a] = await db.select().from(admins).where(and(eq(admins.email, email), eq(admins.isActive, true)));
  // Always run bcrypt so response time doesn't reveal whether the account exists.
  dummyHash ??= await bcrypt.hash("spln-dummy-password", 12);
  const ok = await bcrypt.compare(password, a?.passwordHash ?? dummyHash);
  if (!a || !ok) {
    loginAttempts.set(email, { n: (rec && Date.now() - rec.at < 15 * 60_000 ? rec.n : 0) + 1, at: rec?.at && Date.now() - rec.at < 15 * 60_000 ? rec.at : Date.now() });
    return fail("Email or password is incorrect.");
  }
  loginAttempts.delete(email);
  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, a.id));
  await startAdminSession(a.id);
  await audit(`admin:${a.id}`, "admin.login");
  redirect("/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}

/* ── Stats ────────────────────────────────────────────────────────────── */

export async function saveStats(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const rows = await db.select().from(stats);
  for (const s of rows) {
    const raw = form.get(`value_${s.key}`);
    if (raw === null) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return fail(`"${s.label}" must be a positive number.`);
    const detail = String(form.get(`detail_${s.key}`) ?? "").trim() || null;
    const label = String(form.get(`label_${s.key}`) ?? s.label).trim() || s.label;
    if (value !== s.value || detail !== s.detail || label !== s.label) {
      await db.update(stats).set({ value: Math.round(value), detail, label, updatedAt: new Date() }).where(eq(stats.key, s.key));
      await audit(`admin:${a.id}`, "stats.update", s.key, { from: s.value, to: value });
    }
  }
  revalidatePublic();
  return { ok: true, message: "Numbers updated across the site." };
}

export async function addStat(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const label = String(form.get("label") ?? "").trim();
  const group = form.get("group") === "network" ? "network" : "public_office";
  if (label.length < 3) return fail("Give the number a label.");
  const key = slugify(label).replace(/-/g, "_").slice(0, 40);
  await db.insert(stats).values({ key, label, value: Number(form.get("value")) || 0, group, sortOrder: 99 }).onConflictDoNothing();
  await audit(`admin:${a.id}`, "stats.add", key);
  revalidatePublic();
  revalidatePath("/admin/stats");
  return { ok: true, message: "Added." };
}

export async function deleteStat(form: FormData) {
  const a = await requireAdmin("super_admin");
  const key = String(form.get("key"));
  await db.delete(stats).where(eq(stats.key, key));
  await audit(`admin:${a.id}`, "stats.delete", key);
  revalidatePublic();
  revalidatePath("/admin/stats");
}

/* ── Graduates ────────────────────────────────────────────────────────── */

export async function setGraduateHidden(form: FormData) {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  const hidden = form.get("hidden") === "1";
  const [g] = await db.update(graduates).set({ isHidden: hidden, updatedAt: new Date() }).where(eq(graduates.id, id)).returning({ slug: graduates.slug });
  await audit(`admin:${a.id}`, hidden ? "graduate.hide" : "graduate.unhide", `graduate:${id}`);
  revalidatePublic();
  if (g) revalidatePath(`/graduates/${g.slug}`);
  revalidatePath("/admin/graduates");
}

/**
 * Permanently removes a graduate (super admin only) — for test accounts, duplicates and people added in error.
 * Their sign-in codes and Spotlight stories go with them (FK cascade); their articles are deleted too so no
 * byline-less writing is left behind. Hiding is the reversible option for everyone else.
 */
export async function deleteGraduate(form: FormData) {
  const a = await requireAdmin("super_admin");
  const id = Number(form.get("id"));
  const [g] = await db.select({ slug: graduates.slug, photoUrl: graduates.photoUrl }).from(graduates).where(eq(graduates.id, id));
  if (!g) redirect("/admin/graduates");
  await db.delete(posts).where(eq(posts.authorGraduateId, id));
  await db.delete(graduates).where(eq(graduates.id, id));
  if (g.photoUrl) await deleteStored(g.photoUrl);
  await audit(`admin:${a.id}`, "graduate.delete", `graduate:${id}`);
  revalidatePublic();
  revalidatePath(`/graduates/${g.slug}`);
  redirect("/admin/graduates?deleted=1");
}

const registrySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  cohortId: z.coerce.number().int().positive("Choose a class."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Invalid email.")
    .transform((v) => v || null),
  altEmails: z.string().trim().max(300).transform((v) => v.split(/[\s,;]+/).map(normaliseEmail).filter(Boolean).join(",") || null),
  phone: z.string().trim().max(40).transform((v) => v || null),
  matricNumber: z.string().trim().max(40).transform((v) => v || null),
  stateOfResidence: z.string().trim().max(60).transform((v) => v || null),
  officeStatus: z.enum(["none", "aspirant", "candidate", "appointed", "elected"]),
  officeTitle: z.string().trim().max(120).transform((v) => v || null),
  isHidden: z.coerce.boolean().optional().default(false),
});

export async function saveGraduate(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const id = Number(form.get("id")) || null;
  const data = formToObject(form);
  const reg = registrySchema.safeParse({ altEmails: "", phone: "", matricNumber: "", stateOfResidence: "", officeTitle: "", email: "", ...data });
  const pub = profileSchema.safeParse(data);
  if (!reg.success || !pub.success)
    return fail("Please fix the highlighted fields.", { ...(reg.success ? {} : fieldErrors(reg.error)), ...(pub.success ? {} : fieldErrors(pub.error)) });

  const values = { ...reg.data, ...pub.data, fullName: cleanName(reg.data.fullName), updatedAt: new Date() };
  if (values.email) {
    const [clash] = await db
      .select({ id: graduates.id, fullName: graduates.fullName })
      .from(graduates)
      .where(id ? and(eq(graduates.email, values.email), ne(graduates.id, id)) : eq(graduates.email, values.email));
    if (clash) return fail(`That email already belongs to ${clash.fullName}.`, { email: "Already in use." });
  }

  let slug: string;
  if (id) {
    const [g] = await db.update(graduates).set(values).where(eq(graduates.id, id)).returning({ slug: graduates.slug });
    slug = g.slug;
    await audit(`admin:${a.id}`, "graduate.update", `graduate:${id}`);
  } else {
    const base = slugify(values.fullName) || "graduate";
    slug = base;
    for (let i = 2; (await db.$count(graduates, eq(graduates.slug, slug))) > 0; i++) slug = `${base}-${i}`;
    const [g] = await db.insert(graduates).values({ ...values, slug }).returning({ id: graduates.id });
    await audit(`admin:${a.id}`, "graduate.create", `graduate:${g.id}`);
    revalidatePublic();
    redirect(`/admin/graduates/${g.id}?created=1`);
  }
  revalidatePublic();
  revalidatePath(`/graduates/${slug}`);
  return { ok: true, message: "Graduate saved." };
}

export async function importGraduates(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a CSV file.");
  if (file.size > 5 * 1024 * 1024) return fail("CSV must be under 5 MB.");
  const res = await importGraduatesCsv(db, await file.text());
  await audit(`admin:${a.id}`, "graduate.import", undefined, { created: res.created, updated: res.updated, skipped: res.skipped.length });
  revalidatePublic();
  const notes = [...res.skipped.map((s) => `Skipped row ${s.row}: ${s.reason}`), ...res.warnings.map((w) => `Row ${w.row}: ${w.reason}`)];
  return {
    ok: true,
    message: `Import complete — ${res.created} added, ${res.updated} updated, ${res.skipped.length} skipped.${notes.length ? " " + notes.slice(0, 8).join(" · ") : ""}`,
  };
}

/** Typeahead for picking a graduate (spotlights). Admin only; returns no private fields. */
export async function searchGraduatesAdmin(q: string) {
  await requireAdmin();
  const term = q.trim();
  if (term.length < 2) return [];
  const words = term.split(/\s+/).slice(0, 4);
  return db
    .select({ id: graduates.id, fullName: graduates.fullName, photoUrl: graduates.photoUrl, cohortName: cohorts.name, countryCode: cohorts.countryCode, isHidden: graduates.isHidden })
    .from(graduates)
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .where(and(...words.map((w) => ilike(graduates.fullName, `%${w}%`))))
    .orderBy(asc(graduates.fullName))
    .limit(12);
}

/* ── Spotlights ───────────────────────────────────────────────────────── */

export async function saveSpotlight(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const id = Number(form.get("id")) || null;
  const parsed = spotlightSchema.safeParse(formToObject(form));
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;

  // Optionally update the graduate's profile photo from this form.
  const profilePhoto = String(form.get("profilePhotoUrl") ?? "");
  if (profilePhoto && form.get("setProfilePhoto") === "on") {
    await db.update(graduates).set({ photoUrl: profilePhoto, updatedAt: new Date() }).where(eq(graduates.id, d.graduateId));
  }

  let existing: { publishedAt: Date | null; slug: string } | undefined;
  if (id) [existing] = await db.select({ publishedAt: spotlights.publishedAt, slug: spotlights.slug }).from(spotlights).where(eq(spotlights.id, id));
  const values = {
    ...d,
    publishedAt: d.isPublished ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(spotlights).set(values).where(eq(spotlights.id, id));
    await audit(`admin:${a.id}`, "spotlight.update", `spotlight:${id}`);
    revalidatePublic();
    revalidatePath(`/spotlight/${existing?.slug}`);
    return { ok: true, message: d.isPublished ? "Saved — the story is live." : "Saved as a draft (not public)." };
  }
  const slug = `${slugify(d.title) || "story"}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(spotlights).values({ ...values, slug, createdById: a.id }).returning({ id: spotlights.id });
  await audit(`admin:${a.id}`, "spotlight.create", `spotlight:${row.id}`);
  revalidatePublic();
  redirect(`/admin/spotlights/${row.id}?created=1`);
}

export async function deleteSpotlight(form: FormData) {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  await db.delete(spotlights).where(eq(spotlights.id, id));
  await audit(`admin:${a.id}`, "spotlight.delete", `spotlight:${id}`);
  revalidatePublic();
  redirect("/admin/spotlights");
}

/* ── Posts & review ───────────────────────────────────────────────────── */

export async function saveAdminPost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const id = Number(form.get("id")) || null;
  const publish = form.get("intent") === "publish";
  const parsed = adminPostSchema.safeParse(formToObject(form));
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;

  let existing: typeof posts.$inferSelect | undefined;
  if (id) [existing] = await db.select().from(posts).where(eq(posts.id, id));
  const status = publish ? "published" : existing?.status === "published" ? "published" : existing?.status ?? "draft";
  const values = {
    title: d.title,
    type: d.type,
    topic: d.topic ?? null,
    excerpt: d.excerpt || null,
    body: d.body,
    coverUrl: d.coverUrl ?? null,
    sources: d.sources || null,
    featured: d.featured,
    // Byline override only applies to staff-written pieces.
    authorName: existing?.authorGraduateId ? existing.authorName : d.authorName ?? "SPLN Secretariat",
    status: status as typeof posts.$inferSelect.status,
    publishedAt: status === "published" ? existing?.publishedAt ?? new Date() : null,
    updatedAt: new Date(),
  };

  if (id && existing) {
    await db.update(posts).set(values).where(eq(posts.id, id));
    await audit(`admin:${a.id}`, publish ? "post.publish" : "post.update", `post:${id}`);
    revalidatePublic();
    revalidatePath(`/insights/${existing.slug}`);
    return { ok: true, message: status === "published" ? "Saved — live on Insights." : "Saved." };
  }
  const slug = `${slugify(d.title) || "post"}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(posts).values({ ...values, slug, authorAdminId: a.id }).returning({ id: posts.id });
  await audit(`admin:${a.id}`, "post.create", `post:${row.id}`);
  revalidatePublic();
  redirect(`/admin/posts/${row.id}?saved=1`);
}

/** Editorial decision on a graduate submission. */
export async function reviewPost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  const decision = String(form.get("decision"));
  const note = String(form.get("reviewNote") ?? "").trim() || null;
  if (!["published", "changes_requested", "rejected"].includes(decision)) return fail("Unknown decision.");
  if (decision !== "published" && !note) return fail("Add a note so the author knows what to change.", { reviewNote: "Required when requesting changes or declining." });

  const [p] = await db.select({ slug: posts.slug, publishedAt: posts.publishedAt, status: posts.status }).from(posts).where(eq(posts.id, id));
  if (!p) return fail("Post not found.");
  // The author may have withdrawn it while it was open here.
  if (p.status === "draft") return fail("The author has withdrawn this piece to keep working on it. It will return to the queue when they resubmit.");
  await db
    .update(posts)
    .set({
      status: decision as "published",
      reviewNote: note,
      reviewedById: a.id,
      reviewedAt: new Date(),
      publishedAt: decision === "published" ? p.publishedAt ?? new Date() : p.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  await audit(`admin:${a.id}`, `post.review.${decision}`, `post:${id}`);
  notifyAuthor(id, decision as "published" | "changes_requested" | "rejected");
  revalidatePublic();
  revalidatePath(`/insights/${p.slug}`);
  return {
    ok: true,
    message:
      decision === "published"
        ? "Approved and published. The author has been emailed."
        : decision === "changes_requested"
          ? "Sent back to the author with your note (by email too)."
          : "Declined. The author has your note by email and can revise and resubmit.",
  };
}

/**
 * Takes a post off the site. A graduate's piece needs a reason: it goes back to them as "Changes requested"
 * with that reason (and an email), so they can fix it and resubmit. Staff posts simply return to draft.
 */
export async function unpublishPost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  const reason = String(form.get("reason") ?? "").trim().slice(0, 3000);
  const [p] = await db.select({ slug: posts.slug, authorGraduateId: posts.authorGraduateId }).from(posts).where(eq(posts.id, id));
  if (!p) return fail("Post not found.");
  if (p.authorGraduateId) {
    if (reason.length < 10) return fail("Tell the author why it is being unpublished.", { reason: "Required — the author sees this." });
    await db
      .update(posts)
      .set({ status: "changes_requested", reviewNote: reason, reviewedById: a.id, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(posts.id, id));
    notifyAuthor(id, "unpublished");
  } else {
    await db.update(posts).set({ status: "draft", updatedAt: new Date() }).where(eq(posts.id, id));
  }
  await audit(`admin:${a.id}`, "post.unpublish", `post:${id}`, reason ? { reason } : undefined);
  revalidatePublic();
  revalidatePath(`/insights/${p.slug}`);
  redirect(`/admin/posts/${id}?unpublished=1`);
}

export async function deletePost(form: FormData) {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  await db.delete(posts).where(eq(posts.id, id));
  await audit(`admin:${a.id}`, "post.delete", `post:${id}`);
  revalidatePublic();
  redirect("/admin/posts");
}

/* ── Nominations ──────────────────────────────────────────────────────── */

export async function setNominationStatus(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = String(form.get("status"));
  if (!["new", "reviewed", "featured", "declined"].includes(status)) return;
  await db.update(nominations).set({ status }).where(eq(nominations.id, id));
  revalidatePath("/admin/nominations");
}

export async function deleteNomination(form: FormData) {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  await db.delete(nominations).where(eq(nominations.id, id));
  await audit(`admin:${a.id}`, "nomination.delete", `nomination:${id}`);
  revalidatePath("/admin/nominations");
}

/* ── Countries & cohorts (expansion) ─────────────────────────────────── */

const countrySchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use the 2-letter ISO code, e.g. GH."),
  name: z.string().trim().min(2).max(60),
  flag: z.string().trim().min(1).max(8),
  status: z.enum(["active", "launching", "planned"]),
  admissionsOpen: z.coerce.boolean().optional().default(false),
  admissionsEmail: z.string().trim().max(120).transform((v) => v || null),
  applyUrl: z.string().trim().max(300).transform((v) => v || null),
  partner: z.string().trim().max(160).transform((v) => v || null),
  blurb: z.string().trim().max(400).transform((v) => v || null),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveCountry(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin("super_admin");
  const parsed = countrySchema.safeParse({ admissionsEmail: "", applyUrl: "", partner: "", blurb: "", ...formToObject(form) });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { code, ...rest } = parsed.data;
  await db.insert(countries).values(parsed.data).onConflictDoUpdate({ target: countries.code, set: rest });
  await audit(`admin:${a.id}`, "country.save", code);
  revalidatePublic();
  revalidatePath("/admin/countries");
  return { ok: true, message: `${parsed.data.name} saved.` };
}

const cohortSchema = z.object({
  id: z.coerce.number().int().optional(),
  countryCode: z.string().trim().toUpperCase().length(2),
  name: z.string().trim().min(3).max(60),
  year: z.coerce.number().int().min(2019).max(2100),
  sourceLabel: z.string().trim().max(60).transform((v) => v || null),
});

export async function saveCohort(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin("super_admin");
  const parsed = cohortSchema.safeParse({ sourceLabel: "", ...formToObject(form) });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { id, ...d } = parsed.data;
  if (id) await db.update(cohorts).set(d).where(eq(cohorts.id, id));
  else {
    const slug = `${d.countryCode.toLowerCase()}-${d.year}${(await db.$count(cohorts, eq(cohorts.slug, `${d.countryCode.toLowerCase()}-${d.year}`))) ? `-${Date.now() % 1000}` : ""}`;
    await db.insert(cohorts).values({ ...d, slug, sortOrder: 100 + d.year });
  }
  await audit(`admin:${a.id}`, "cohort.save", d.name);
  revalidatePublic();
  revalidatePath("/admin/countries");
  return { ok: true, message: "Class saved." };
}

/* ── Admin accounts ───────────────────────────────────────────────────── */

export async function saveAdminUser(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin("super_admin");
  const name = String(form.get("name") ?? "").trim();
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  const role = form.get("role") === "super_admin" ? "super_admin" : "editor";
  if (name.length < 2) return fail("Enter a name.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Enter a valid email.");
  if (password.length < 10) return fail("Password must be at least 10 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(admins).values({ name, email, passwordHash, role }).onConflictDoUpdate({ target: admins.email, set: { name, passwordHash, role, isActive: true } });
  await audit(`admin:${a.id}`, "admin.save", email, { role });
  revalidatePath("/admin/admins");
  return { ok: true, message: `${name} can now sign in.` };
}

export async function setAdminActive(form: FormData) {
  const a = await requireAdmin("super_admin");
  const id = Number(form.get("id"));
  if (id === a.id) return; // never lock yourself out
  await db.update(admins).set({ isActive: form.get("active") === "1" }).where(eq(admins.id, id));
  await audit(`admin:${a.id}`, "admin.toggle", `admin:${id}`);
  revalidatePath("/admin/admins");
}

export async function changeOwnPassword(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 10) return fail("New password must be at least 10 characters.");
  const [row] = await db.select().from(admins).where(eq(admins.id, a.id));
  if (!(await bcrypt.compare(current, row.passwordHash))) return fail("Current password is incorrect.");
  await db.update(admins).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(admins.id, a.id));
  await audit(`admin:${a.id}`, "admin.password");
  return { ok: true, message: "Password changed." };
}


/* ── Sample content (demo mode) ───────────────────────────────────────── */

export async function loadSampleContent() {
  const a = await requireAdmin();
  const res = await loadSamples(db, a.id);
  await audit(`admin:${a.id}`, "samples.load", undefined, res);
  revalidatePublic();
  revalidatePath("/admin");
  redirect("/admin?samples=loaded");
}

export async function removeSampleContent() {
  const a = await requireAdmin();
  await removeSamples(db);
  await audit(`admin:${a.id}`, "samples.remove");
  revalidatePublic();
  revalidatePath("/admin");
  redirect("/admin?samples=removed");
}

/* ── Gallery ──────────────────────────────────────────────────────────── */

const galleryUploadSchema = z.object({
  countryCode: z.string().trim().toUpperCase().length(2, "Choose a country."),
  cohortId: z.coerce.number().int().optional().transform((v) => v || null),
  occasion: z.string().trim().min(2, "Name the occasion, e.g. Graduation.").max(60),
  photos: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as { url: string; width: number; height: number; caption?: string }[];
      } catch {
        ctx.addIssue({ code: "custom", message: "Upload data is invalid." });
        return z.NEVER;
      }
    })
    .refine((arr) => arr.length > 0 && arr.length <= 100, "Upload between 1 and 100 photos.")
    .refine((arr) => arr.every((p) => p.url.startsWith("/uploads/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(p.url)), "Photos must be uploaded with the uploader."),
});

export async function addGalleryPhotos(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const a = await requireAdmin();
  const parsed = galleryUploadSchema.safeParse(formToObject(form));
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { countryCode, cohortId, occasion, photos } = parsed.data;
  if (cohortId) {
    const [c] = await db.select({ countryCode: cohorts.countryCode }).from(cohorts).where(eq(cohorts.id, cohortId));
    if (c?.countryCode !== countryCode) return fail("That class doesn't belong to the selected country.");
  }
  await db.insert(galleryPhotos).values(
    photos.map((p, i) => ({
      url: p.url,
      width: Math.round(p.width) || null,
      height: Math.round(p.height) || null,
      caption: p.caption?.trim().slice(0, 200) || null,
      countryCode,
      cohortId,
      occasion,
      sortOrder: i,
      createdById: a.id,
    })),
  );
  await audit(`admin:${a.id}`, "gallery.add", `${countryCode}/${cohortId ?? "-"}`, { count: photos.length });
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true, message: `${photos.length} photo${photos.length === 1 ? "" : "s"} added to the gallery.` };
}

export async function updateGalleryPhoto(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const intent = String(form.get("intent"));
  if (intent === "feature") {
    await db.update(galleryPhotos).set({ featured: form.get("featured") === "1" }).where(eq(galleryPhotos.id, id));
  } else if (intent === "caption") {
    await db.update(galleryPhotos).set({ caption: String(form.get("caption") ?? "").trim().slice(0, 200) || null }).where(eq(galleryPhotos.id, id));
  }
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryPhoto(form: FormData) {
  const a = await requireAdmin();
  const id = Number(form.get("id"));
  const [p] = await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id)).returning({ url: galleryPhotos.url });
  if (p && !p.url.startsWith("/images/")) await deleteStored(p.url);
  await audit(`admin:${a.id}`, "gallery.delete", `gallery:${id}`);
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

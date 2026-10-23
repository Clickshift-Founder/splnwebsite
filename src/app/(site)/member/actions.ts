"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { graduates, posts } from "@/db/schema";
import { requireMember } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/text";
import { DECLARATIONS } from "@/content/site";
import { fieldErrors, formToObject, memberPostSchema, profileSchema } from "@/lib/validation";
import type { ActionResult } from "@/components/ui/form";

export async function updateProfile(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const me = await requireMember();
  const parsed = profileSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  await db.update(graduates).set({ ...parsed.data, updatedAt: new Date() }).where(eq(graduates.id, me.id));
  await audit(`graduate:${me.id}`, "profile.update");
  revalidatePath(`/graduates/${me.slug}`);
  revalidatePath("/graduates");
  revalidatePath("/");
  return { ok: true, message: "Profile saved — it's live in the directory." };
}

/** Create or update the signed-in graduate's own submission. intent = "draft" | "submit". */
export async function savePost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const me = await requireMember();
  const intent = form.get("intent") === "submit" ? "submit" : "draft";
  const id = Number(form.get("id")) || null;
  const data = formToObject(form);

  const parsed = memberPostSchema.safeParse(data);
  if (!parsed.success) {
    // Drafts may be incomplete: only require a title.
    if (intent === "draft" && String(data.title ?? "").trim().length >= 3) {
      // fall through with partial data below
    } else return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const declared = DECLARATIONS.filter((_, i) => form.get(`decl_${i}`) === "on");
  if (intent === "submit" && declared.length !== DECLARATIONS.length)
    return { ok: false, error: "Please confirm every editorial declaration before submitting.", fieldErrors: { declarations: "All declarations are required." } };

  // A half-finished draft still keeps a valid cover image.
  const cover = memberPostSchema.shape.coverUrl.safeParse(data.coverUrl);
  const values = {
    title: String(data.title ?? "").trim().slice(0, 160),
    type: (data.type === "thought_leadership" ? "thought_leadership" : "article") as "article" | "thought_leadership",
    topic: String(data.topic ?? "").trim().slice(0, 60) || null,
    excerpt: String(data.excerpt ?? "").trim().slice(0, 320) || null,
    body: String(data.body ?? "").trim().slice(0, 40000),
    coverUrl: cover.success ? cover.data ?? null : null,
    sources: String(data.sources ?? "").trim().slice(0, 5000) || null,
    declarations: declared,
    status: intent === "submit" ? ("pending" as "pending" | "draft" | "changes_requested") : ("draft" as const),
    updatedAt: new Date(),
  };

  let wasPending = false;
  if (id) {
    const [own] = await db
      .select({ id: posts.id, status: posts.status })
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.authorGraduateId, me.id), inArray(posts.status, ["draft", "pending", "changes_requested"])));
    if (!own) return { ok: false, error: "You can't edit this piece (it may already be published)." };
    // Saving revisions keeps "Changes requested" (and the editor's note) visible until the author resubmits.
    if (intent === "draft" && own.status === "changes_requested") values.status = "changes_requested";
    wasPending = intent === "draft" && own.status === "pending";
    await db.update(posts).set(values).where(eq(posts.id, id));
  } else {
    const slug = `${slugify(values.title) || "article"}-${Math.random().toString(36).slice(2, 7)}`;
    const [row] = await db
      .insert(posts)
      .values({ ...values, slug, authorGraduateId: me.id })
      .returning({ id: posts.id });
    await audit(`graduate:${me.id}`, `post.${intent}`, `post:${row.id}`);
    revalidatePath("/member");
    redirect(intent === "submit" ? "/member?submitted=1" : `/member/write/${row.id}?saved=1`);
  }

  await audit(`graduate:${me.id}`, `post.${intent}`, `post:${id}`);
  revalidatePath("/member");
  if (intent === "submit") redirect("/member?submitted=1");
  return {
    ok: true,
    message: wasPending ? "Saved as a draft — it's no longer in the review queue. Press Submit for review when it's ready." : "Draft saved.",
  };
}

export async function withdrawPost(form: FormData) {
  const me = await requireMember();
  const id = Number(form.get("id"));
  await db
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(and(eq(posts.id, id), eq(posts.authorGraduateId, me.id), eq(posts.status, "pending")));
  revalidatePath("/member");
}

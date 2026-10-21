import { eq } from "drizzle-orm";
import type { DB } from "@/db/connect";
import { cohorts, graduates } from "@/db/schema";
import { parseCsv } from "./csv";
import { cleanName, normaliseEmail, slugify } from "./text";

const BLANK = /^(nil|null|none|n\/?a|-|)$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ImportResult = {
  created: number;
  updated: number;
  skipped: { row: number; reason: string }[];
  warnings: { row: number; reason: string }[];
};

/** "a@x.com or b@y.com" / "a@x.com; b@y.com" → ["a@x.com", "b@y.com"] */
export function splitEmails(raw: string): string[] {
  return raw
    .split(/\s+or\s+|[;,/\s]+/i)
    .map(normaliseEmail)
    .filter((e) => EMAIL.test(e));
}

/**
 * Upserts graduates from a registry CSV with columns:
 *   Name, Email, Matric Number, Phone Number, State of Residence, Class
 * "Class" must match a cohort's `source_label` (or its name/slug). Matching is by email
 * (or name + cohort when no email is on file), so re-importing an updated registry never
 * duplicates people and never overwrites public profile fields graduates wrote themselves.
 */
export async function importGraduatesCsv(db: DB, csvText: string): Promise<ImportResult> {
  const rows = parseCsv(csvText);
  const allCohorts = await db.select().from(cohorts);
  const cohortFor = (label: string) => {
    const l = label.trim().toLowerCase();
    return allCohorts.find((c) => c.sourceLabel?.toLowerCase() === l || c.name.toLowerCase() === l || c.slug === l);
  };

  const existing = await db
    .select({ id: graduates.id, email: graduates.email, slug: graduates.slug, fullName: graduates.fullName, cohortId: graduates.cohortId })
    .from(graduates);
  const byEmail = new Map(existing.filter((g) => g.email).map((g) => [g.email!, g.id]));
  const byNameCohort = new Map(existing.map((g) => [`${g.fullName.toLowerCase()}|${g.cohortId}`, g.id]));
  const usedSlugs = new Set(existing.map((g) => g.slug));
  const uniqueSlug = (name: string) => {
    const base = slugify(name) || "graduate";
    let s = base;
    for (let i = 2; usedSlugs.has(s); i++) s = `${base}-${i}`;
    usedSlugs.add(s);
    return s;
  };

  const result: ImportResult = { created: 0, updated: 0, skipped: [], warnings: [] };
  const toInsert: (typeof graduates.$inferInsert)[] = [];

  for (const [i, r] of rows.entries()) {
    const line = i + 2; // header is line 1
    const name = cleanName(r["Name"] ?? "");
    const cohort = cohortFor(r["Class"] ?? "");
    if (!name) { result.skipped.push({ row: line, reason: "Missing name" }); continue; }
    if (!cohort) { result.skipped.push({ row: line, reason: `Unknown class "${r["Class"]}" for ${name}` }); continue; }

    const [email = null, ...alt] = splitEmails(r["Email"] ?? "");
    if (!email) result.warnings.push({ row: line, reason: `No valid email for ${name} — listed, but can't claim their profile until one is added` });

    const registry = {
      fullName: name,
      cohortId: cohort.id,
      altEmails: alt.length ? alt.join(",") : null,
      phone: BLANK.test(r["Phone Number"] ?? "") ? null : r["Phone Number"],
      matricNumber: BLANK.test(r["Matric Number"] ?? "") ? null : r["Matric Number"],
      stateOfResidence: BLANK.test(r["State of Residence"] ?? "") ? null : r["State of Residence"],
    };

    const key = `${name.toLowerCase()}|${cohort.id}`;
    // Email is the identity; name + cohort is only a fallback for people with no email (namesakes are common).
    const foundId = email ? byEmail.get(email) : byNameCohort.get(key);
    if (foundId && foundId > 0) {
      await db.update(graduates).set({ ...registry, ...(email ? { email } : {}), updatedAt: new Date() }).where(eq(graduates.id, foundId));
      result.updated++;
    } else if (foundId === -1) {
      result.skipped.push({ row: line, reason: `Duplicate of an earlier row in this file: ${name}` });
    } else {
      toInsert.push({ ...registry, email, slug: uniqueSlug(name) });
      if (email) byEmail.set(email, -1);
      byNameCohort.set(key, -1);
    }
  }

  for (let i = 0; i < toInsert.length; i += 200) {
    await db.insert(graduates).values(toInsert.slice(i, i + 200));
  }
  result.created = toInsert.length;
  return result;
}

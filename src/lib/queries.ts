import "server-only";
import { and, asc, count, desc, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, countries, galleryPhotos, graduates, posts, spotlights, stats } from "@/db/schema";

/**
 * The ONLY graduate columns allowed on public pages. Email, phone, matric number and
 * state of residence are deliberately absent — see CLAUDE.md §5 (Privacy).
 */
export const publicGraduateColumns = {
  id: graduates.id,
  slug: graduates.slug,
  fullName: graduates.fullName,
  headline: graduates.headline,
  bio: graduates.bio,
  photoUrl: graduates.photoUrl,
  location: graduates.location,
  linkedinUrl: graduates.linkedinUrl,
  xUrl: graduates.xUrl,
  facebookUrl: graduates.facebookUrl,
  officeStatus: graduates.officeStatus,
  officeTitle: graduates.officeTitle,
  profileClaimedAt: graduates.profileClaimedAt,
  isSample: graduates.isSample,
  cohortId: cohorts.id,
  cohortName: cohorts.name,
  cohortSlug: cohorts.slug,
  cohortYear: cohorts.year,
  countryCode: countries.code,
  countryName: countries.name,
  countryFlag: countries.flag,
};

export type PublicGraduate = NonNullable<Awaited<ReturnType<typeof getGraduateBySlug>>>;

const visible = eq(graduates.isHidden, false);

/* ── Countries, cohorts, totals ─────────────────────────────────────────── */

export async function getCountries() {
  return db.select().from(countries).orderBy(asc(countries.sortOrder));
}

export async function getCohorts() {
  return db.select().from(cohorts).orderBy(asc(cohorts.sortOrder));
}

/** Network-wide numbers, computed live from the registry (hidden graduates still count; sample personas never do). */
export async function getNetworkTotals() {
  const byCohort = await db
    .select({ cohortId: graduates.cohortId, n: count() })
    .from(graduates)
    .where(eq(graduates.isSample, false))
    .groupBy(graduates.cohortId);
  const [allCountries, allCohorts] = await Promise.all([getCountries(), getCohorts()]);
  const cohortCount = new Map(byCohort.map((r) => [r.cohortId, Number(r.n)]));

  const countriesOut = allCountries.map((c) => {
    const cs = allCohorts
      .filter((k) => k.countryCode === c.code)
      .map((k) => ({ ...k, graduates: cohortCount.get(k.id) ?? 0 }));
    return { ...c, cohorts: cs, graduates: cs.reduce((s, k) => s + k.graduates, 0) };
  });

  return {
    graduates: countriesOut.reduce((s, c) => s + c.graduates, 0),
    cohorts: allCohorts.filter((k) => (cohortCount.get(k.id) ?? 0) > 0).length,
    countriesWithGraduates: countriesOut.filter((c) => c.graduates > 0).length,
    countries: countriesOut,
  };
}

export async function getStats(group?: string) {
  const rows = await db
    .select()
    .from(stats)
    .where(group ? eq(stats.group, group) : undefined)
    .orderBy(asc(stats.sortOrder));
  return rows;
}

export async function getStatMap() {
  const rows = await getStats();
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}

/* ── Directory ──────────────────────────────────────────────────────────── */

export const DIRECTORY_PAGE_SIZE = 36;

export type DirectoryFilters = {
  q?: string;
  country?: string;
  cohort?: string;
  office?: string; // "any" = any office status other than none
  page?: number;
};

function directoryWhere(f: DirectoryFilters): SQL | undefined {
  const parts: (SQL | undefined)[] = [visible];
  const q = f.q?.trim();
  if (q) {
    const terms = q.split(/\s+/).slice(0, 5);
    for (const t of terms) {
      parts.push(or(ilike(graduates.fullName, `%${t}%`), ilike(graduates.headline, `%${t}%`), ilike(graduates.location, `%${t}%`)));
    }
  }
  if (f.country) parts.push(eq(countries.code, f.country.toUpperCase()));
  if (f.cohort) parts.push(eq(cohorts.slug, f.cohort));
  if (f.office === "any") parts.push(ne(graduates.officeStatus, "none"));
  else if (f.office && ["aspirant", "candidate", "appointed", "elected"].includes(f.office))
    parts.push(eq(graduates.officeStatus, f.office as "aspirant"));
  return and(...parts);
}

export async function listGraduates(f: DirectoryFilters) {
  const page = Math.max(1, f.page ?? 1);
  const where = directoryWhere(f);
  const base = () =>
    db
      .select(publicGraduateColumns)
      .from(graduates)
      .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
      .innerJoin(countries, eq(cohorts.countryCode, countries.code));

  const [items, [{ total }]] = await Promise.all([
    base()
      .where(where)
      // Completed profiles first — the directory should feel alive.
      .orderBy(sql`(${graduates.photoUrl} is null)`, sql`(${graduates.bio} is null)`, asc(graduates.fullName))
      .limit(DIRECTORY_PAGE_SIZE)
      .offset((page - 1) * DIRECTORY_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(graduates)
      .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
      .innerJoin(countries, eq(cohorts.countryCode, countries.code))
      .where(where),
  ]);
  return { items, total: Number(total), page, pages: Math.max(1, Math.ceil(Number(total) / DIRECTORY_PAGE_SIZE)) };
}

export async function getGraduateBySlug(slug: string) {
  const [g] = await db
    .select(publicGraduateColumns)
    .from(graduates)
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .innerJoin(countries, eq(cohorts.countryCode, countries.code))
    .where(and(eq(graduates.slug, slug), visible));
  return g ?? null;
}

/** Profiles with a photo — for the homepage "faces of the network" wall. */
export async function getFeaturedFaces(limit = 12) {
  return db
    .select(publicGraduateColumns)
    .from(graduates)
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .innerJoin(countries, eq(cohorts.countryCode, countries.code))
    .where(and(visible, sql`${graduates.photoUrl} is not null`))
    .orderBy(desc(graduates.updatedAt))
    .limit(limit);
}

export async function getClassmates(cohortId: number, excludeId: number, limit = 8) {
  return db
    .select(publicGraduateColumns)
    .from(graduates)
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .innerJoin(countries, eq(cohorts.countryCode, countries.code))
    .where(and(visible, eq(graduates.cohortId, cohortId), ne(graduates.id, excludeId)))
    .orderBy(sql`(${graduates.photoUrl} is null)`, sql`random()`)
    .limit(limit);
}

/* ── Insights ───────────────────────────────────────────────────────────── */

const postColumns = {
  id: posts.id,
  slug: posts.slug,
  type: posts.type,
  title: posts.title,
  excerpt: posts.excerpt,
  body: posts.body,
  coverUrl: posts.coverUrl,
  topic: posts.topic,
  sources: posts.sources,
  featured: posts.featured,
  isSample: posts.isSample,
  publishedAt: posts.publishedAt,
  authorName: posts.authorName,
  authorSlug: graduates.slug,
  authorFullName: graduates.fullName,
  authorPhoto: graduates.photoUrl,
  authorHeadline: graduates.headline,
  authorHidden: graduates.isHidden,
};

export type PostListItem = Awaited<ReturnType<typeof listPublishedPosts>>["items"][number];

export async function listPublishedPosts({ type, page = 1, limit = 12 }: { type?: string; page?: number; limit?: number } = {}) {
  const where = and(
    eq(posts.status, "published"),
    type && ["news", "article", "thought_leadership"].includes(type) ? eq(posts.type, type as "news") : undefined,
  );
  const [items, [{ total }]] = await Promise.all([
    db
      .select(postColumns)
      .from(posts)
      .leftJoin(graduates, eq(posts.authorGraduateId, graduates.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(posts).where(where),
  ]);
  return { items, total: Number(total), pages: Math.max(1, Math.ceil(Number(total) / limit)) };
}

export async function getPublishedPost(slug: string) {
  const [p] = await db
    .select(postColumns)
    .from(posts)
    .leftJoin(graduates, eq(posts.authorGraduateId, graduates.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")));
  return p ?? null;
}

export async function getPostsByGraduate(graduateId: number) {
  return db
    .select(postColumns)
    .from(posts)
    .leftJoin(graduates, eq(posts.authorGraduateId, graduates.id))
    .where(and(eq(posts.authorGraduateId, graduateId), eq(posts.status, "published")))
    .orderBy(desc(posts.publishedAt));
}

/* ── Spotlight ──────────────────────────────────────────────────────────── */

const spotlightColumns = {
  id: spotlights.id,
  slug: spotlights.slug,
  category: spotlights.category,
  title: spotlights.title,
  summary: spotlights.summary,
  story: spotlights.story,
  coverUrl: spotlights.coverUrl,
  gallery: spotlights.gallery,
  evidenceLinks: spotlights.evidenceLinks,
  featured: spotlights.featured,
  isSample: spotlights.isSample,
  publishedAt: spotlights.publishedAt,
  graduateId: graduates.id,
  graduateSlug: graduates.slug,
  graduateName: graduates.fullName,
  graduatePhoto: graduates.photoUrl,
  graduateHeadline: graduates.headline,
  graduateHidden: graduates.isHidden,
  cohortName: cohorts.name,
  countryCode: countries.code,
  countryName: countries.name,
  countryFlag: countries.flag,
};

export type SpotlightItem = Awaited<ReturnType<typeof listSpotlights>>[number];

export async function listSpotlights({ category, limit = 24, graduateId }: { category?: string; limit?: number; graduateId?: number } = {}) {
  return db
    .select(spotlightColumns)
    .from(spotlights)
    .innerJoin(graduates, eq(spotlights.graduateId, graduates.id))
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .innerJoin(countries, eq(cohorts.countryCode, countries.code))
    .where(
      and(
        eq(spotlights.isPublished, true),
        category ? eq(spotlights.category, category) : undefined,
        graduateId ? eq(spotlights.graduateId, graduateId) : undefined,
      ),
    )
    .orderBy(desc(spotlights.featured), desc(spotlights.publishedAt))
    .limit(limit);
}

export async function getPublishedSpotlight(slug: string) {
  const [s] = await db
    .select(spotlightColumns)
    .from(spotlights)
    .innerJoin(graduates, eq(spotlights.graduateId, graduates.id))
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .innerJoin(countries, eq(cohorts.countryCode, countries.code))
    .where(and(eq(spotlights.slug, slug), eq(spotlights.isPublished, true)));
  return s ?? null;
}

export async function getSpotlightCategoriesInUse() {
  const rows = await db
    .select({ category: spotlights.category, n: count() })
    .from(spotlights)
    .where(eq(spotlights.isPublished, true))
    .groupBy(spotlights.category);
  return rows.map((r) => ({ category: r.category, n: Number(r.n) }));
}


/* ── Gallery ────────────────────────────────────────────────────────────── */

export type GalleryItem = Awaited<ReturnType<typeof listGallery>>[number];

export async function listGallery({ country, featuredOnly, limit = 500 }: { country?: string; featuredOnly?: boolean; limit?: number } = {}) {
  return db
    .select({
      id: galleryPhotos.id,
      url: galleryPhotos.url,
      width: galleryPhotos.width,
      height: galleryPhotos.height,
      caption: galleryPhotos.caption,
      occasion: galleryPhotos.occasion,
      featured: galleryPhotos.featured,
      isSample: galleryPhotos.isSample,
      countryCode: galleryPhotos.countryCode,
      cohortId: galleryPhotos.cohortId,
      cohortName: cohorts.name,
      cohortYear: cohorts.year,
      cohortSort: cohorts.sortOrder,
    })
    .from(galleryPhotos)
    .leftJoin(cohorts, eq(galleryPhotos.cohortId, cohorts.id))
    .where(and(country ? eq(galleryPhotos.countryCode, country.toUpperCase()) : undefined, featuredOnly ? eq(galleryPhotos.featured, true) : undefined))
    .orderBy(desc(galleryPhotos.featured), asc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt))
    .limit(limit);
}

import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates, posts, spotlights } from "@/db/schema";

// Generated per request, never at build time: a fresh database has no tables until
// migrations run, and a sitemap must never break a deploy.
export const dynamic = "force-dynamic";

const PAGES = ["", "/about", "/join", "/graduates", "/spotlight", "/insights", "/gallery", "/network", "/impact", "/events", "/write"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticEntries = PAGES.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }));

  try {
    const [grads, ps, ss] = await Promise.all([
      db.select({ slug: graduates.slug, updatedAt: graduates.updatedAt }).from(graduates).where(and(eq(graduates.isHidden, false), eq(graduates.isSample, false))),
      db.select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(and(eq(posts.status, "published"), eq(posts.isSample, false))),
      db.select({ slug: spotlights.slug, updatedAt: spotlights.updatedAt }).from(spotlights).where(and(eq(spotlights.isPublished, true), eq(spotlights.isSample, false))),
    ]);
    return [
      ...staticEntries,
      ...ss.map((s) => ({ url: `${base}/spotlight/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
      ...ps.map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
      ...grads.map((g) => ({ url: `${base}/graduates/${g.slug}`, lastModified: g.updatedAt, priority: 0.4 })),
    ];
  } catch (e) {
    console.error("[sitemap] database unavailable, serving static entries", e);
    return staticEntries;
  }
}

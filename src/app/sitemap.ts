import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates, posts, spotlights } from "@/db/schema";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [grads, ps, ss] = await Promise.all([
    db.select({ slug: graduates.slug, updatedAt: graduates.updatedAt }).from(graduates).where(and(eq(graduates.isHidden, false))),
    db.select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(eq(posts.status, "published")),
    db.select({ slug: spotlights.slug, updatedAt: spotlights.updatedAt }).from(spotlights).where(eq(spotlights.isPublished, true)),
  ]);
  const pages = ["", "/about", "/join", "/graduates", "/spotlight", "/insights", "/network", "/impact", "/events", "/write"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...ss.map((s) => ({ url: `${base}/spotlight/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
    ...ps.map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...grads.map((g) => ({ url: `${base}/graduates/${g.slug}`, lastModified: g.updatedAt, priority: 0.4 })),
  ];
}

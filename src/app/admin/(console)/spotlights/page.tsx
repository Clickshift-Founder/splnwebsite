import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, graduates, spotlights } from "@/db/schema";
import { AdminHeader, Table } from "@/components/admin/ui";
import { Avatar, Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";

export default async function AdminSpotlightsPage() {
  await requireAdmin();
  const rows = await db
    .select({
      id: spotlights.id,
      slug: spotlights.slug,
      title: spotlights.title,
      category: spotlights.category,
      isPublished: spotlights.isPublished,
      featured: spotlights.featured,
      updatedAt: spotlights.updatedAt,
      name: graduates.fullName,
      photo: graduates.photoUrl,
      countryCode: cohorts.countryCode,
    })
    .from(spotlights)
    .innerJoin(graduates, eq(spotlights.graduateId, graduates.id))
    .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
    .orderBy(desc(spotlights.updatedAt));

  return (
    <>
      <AdminHeader
        title="Spotlight"
        sub="Stories of what graduates are up to. Each story has its own public page."
        actions={<ButtonLink href="/admin/spotlights/new" size="sm">New story</ButtonLink>}
      />
      {rows.length === 0 ? (
        <EmptyState title="No stories yet" body="Start with a nomination, or write the first story yourself." action={<ButtonLink href="/admin/spotlights/new">Create a story</ButtonLink>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Story</th>
              <th>Graduate</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/spotlights/${r.id}`} className="font-bold hover:text-green-deep">
                    {r.title}
                  </Link>
                  <p className="text-xs text-slate">{r.category}</p>
                </td>
                <td>
                  <span className="flex items-center gap-2">
                    <Avatar name={r.name} src={r.photo} countryCode={r.countryCode} size={28} /> {r.name}
                  </span>
                </td>
                <td className="space-x-1">
                  {r.isPublished ? <Badge accent="green">Live</Badge> : <Badge>Draft</Badge>}
                  {r.featured && <Badge accent="amber">Featured</Badge>}
                </td>
                <td className="whitespace-nowrap text-slate">{formatDate(r.updatedAt, { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

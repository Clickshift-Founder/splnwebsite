import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates, posts } from "@/db/schema";
import { AdminHeader, Table } from "@/components/admin/ui";
import { Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { TYPE_LABEL } from "@/components/site/cards";
import { POST_STATUS, cn } from "@/lib/brand";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";

const TABS = ["pending", "published", "changes_requested", "draft", "rejected"] as const;

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const st = (TABS as readonly string[]).includes(status) ? (status as (typeof TABS)[number]) : "pending";

  const [rows, counts] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, type: posts.type, updatedAt: posts.updatedAt, author: graduates.fullName, authorName: posts.authorName, featured: posts.featured })
      .from(posts)
      .leftJoin(graduates, eq(posts.authorGraduateId, graduates.id))
      .where(eq(posts.status, st))
      .orderBy(st === "pending" ? posts.updatedAt : desc(posts.updatedAt)),
    db.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status),
  ]);
  const n = (s: string) => Number(counts.find((c) => c.status === s)?.n ?? 0);

  return (
    <>
      <AdminHeader
        title="Insights & review"
        sub="Approve graduate submissions against the SPPG standard, and publish network news."
        actions={<ButtonLink href="/admin/posts/new" size="sm">New post</ButtonLink>}
      />
      <nav className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/posts?status=${t}`}
            className={cn("rounded-full px-4 py-2 text-sm font-bold", st === t ? "bg-ink text-white" : "border border-line bg-white hover:border-ink/40")}
          >
            {POST_STATUS[t].label} <span className="opacity-60">{n(t)}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title={st === "pending" ? "Review queue is clear" : "Nothing here"} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Format</th>
              <th>{st === "pending" ? "Submitted" : "Updated"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-bold">
                  {r.title} {r.featured && <Badge accent="amber">Featured</Badge>}
                </td>
                <td>{r.author ? <span>{r.author} <Badge accent="green">Graduate</Badge></span> : (r.authorName ?? "Staff")}</td>
                <td className="whitespace-nowrap">{TYPE_LABEL[r.type]}</td>
                <td className="whitespace-nowrap text-slate">{formatDate(r.updatedAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="text-right">
                  <ButtonLink href={`/admin/posts/${r.id}`} size="sm" variant={st === "pending" ? "primary" : "secondary"}>
                    {st === "pending" ? "Review" : "Open"}
                  </ButtonLink>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

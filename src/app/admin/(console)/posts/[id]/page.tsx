import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/db";
import { cohorts, graduates, posts } from "@/db/schema";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { Avatar, Badge, ButtonLink } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import { TYPE_LABEL } from "@/components/site/cards";
import { DECLARATIONS, WRITING_STANDARDS } from "@/content/site";
import { POST_STATUS } from "@/lib/brand";
import { requireAdmin } from "@/lib/auth";
import { formatDate, readingTime } from "@/lib/text";
import { deletePost, unpublishPost } from "../../../actions";
import { AdminPostForm, ReviewForm } from "../post-admin-forms";

export default async function AdminPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  if (id === "new")
    return (
      <>
        <AdminHeader back={{ href: "/admin/posts", label: "Insights" }} title="New post" sub="Network news or a staff-written piece. Published under the SPLN Secretariat byline unless you change it." />
        <div className="rounded-[12px] border border-line bg-white p-5 md:p-8">
          <AdminPostForm />
        </div>
      </>
    );

  const [p] = await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (!p) notFound();
  const [author] = p.authorGraduateId
    ? await db
        .select({ id: graduates.id, fullName: graduates.fullName, photoUrl: graduates.photoUrl, slug: graduates.slug, cohortName: cohorts.name, countryCode: cohorts.countryCode, headline: graduates.headline })
        .from(graduates)
        .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
        .where(eq(graduates.id, p.authorGraduateId))
    : [null];

  const sources = (p.sources ?? "").split("\n").filter((s) => s.trim());
  const reviewable = author && ["pending", "changes_requested", "rejected", "published"].includes(p.status);

  return (
    <>
      <AdminHeader
        back={{ href: `/admin/posts?status=${p.status}`, label: "Insights" }}
        title={p.title}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            <Badge accent={POST_STATUS[p.status].accent}>{POST_STATUS[p.status].label}</Badge> {TYPE_LABEL[p.type]} · {readingTime(p.body)} min read · updated {formatDate(p.updatedAt)}
          </span>
        }
        actions={
          <>
            {p.status === "published" && (
              <>
                <ButtonLink href={`/insights/${p.slug}`} size="sm" variant="secondary">
                  View live ↗
                </ButtonLink>
                <form action={unpublishPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-9 rounded-[4px] border border-line bg-white px-3 text-sm font-bold hover:border-ink">Unpublish</button>
                </form>
              </>
            )}
            <form action={deletePost}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Delete this post permanently? The author will lose it too." className="h-9 rounded-[4px] px-3 text-sm font-bold text-red hover:bg-red-tint">
                Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      {saved && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Saved.</p>}

      {author ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Panel title="Submission preview">
              {p.excerpt && <p className="mb-6 text-lg font-semibold text-slate">{p.excerpt}</p>}
              <Markdown>{p.body}</Markdown>
            </Panel>
            <Panel title={`Sources (${sources.length})`}>
              {sources.length ? (
                <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                  {sources.map((s, i) => (
                    <li key={i} className="break-words">
                      {s}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm font-bold text-red">No sources listed.</p>
              )}
            </Panel>
            <details className="rounded-[12px] border border-line bg-white p-5">
              <summary className="cursor-pointer font-extrabold">Edit the content (light editing for clarity)</summary>
              <div className="mt-6">
                <AdminPostForm p={p} />
              </div>
            </details>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <Panel title="Author">
              <div className="flex items-center gap-3">
                <Avatar name={author.fullName} src={author.photoUrl} countryCode={author.countryCode} size={44} />
                <div className="min-w-0">
                  <Link href={`/admin/graduates/${author.id}`} className="font-extrabold hover:underline">
                    {author.fullName}
                  </Link>
                  <p className="text-sm text-slate">{author.cohortName}</p>
                </div>
              </div>
            </Panel>
            <Panel title="Author's declarations">
              <ul className="space-y-2 text-sm">
                {DECLARATIONS.map((d) => {
                  const ok = p.declarations?.includes(d);
                  return (
                    <li key={d} className="flex gap-2">
                      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-red" />}
                      <span className={ok ? "" : "text-red"}>{d}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
            {reviewable && (
              <Panel title="Decision">
                <ReviewForm id={p.id} note={p.reviewNote} />
              </Panel>
            )}
            <details className="rounded-[12px] border border-line bg-white p-5 text-sm">
              <summary className="cursor-pointer font-extrabold">Reviewer checklist</summary>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-slate">
                {WRITING_STANDARDS.map((s) => (
                  <li key={s.title}>
                    <strong className="text-ink">{s.title}.</strong> {s.body}
                  </li>
                ))}
              </ol>
            </details>
          </aside>
        </div>
      ) : (
        <div className="rounded-[12px] border border-line bg-white p-5 md:p-8">
          <AdminPostForm p={p} />
        </div>
      )}
    </>
  );
}

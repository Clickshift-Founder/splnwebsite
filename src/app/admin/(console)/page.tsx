import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, graduates, nominations, posts, spotlights } from "@/db/schema";
import { AdminHeader, Panel, StatCard } from "@/components/admin/ui";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { sampleCounts } from "@/lib/samples";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { loadSampleContent, removeSampleContent } from "../actions";

const claimPct = (n: number, of: number) => {
  const p = (n / Math.max(1, of)) * 100;
  return n > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`;
};

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string; samples?: string }> }) {
  const admin = await requireAdmin();
  const { denied, samples: samplesMsg } = await searchParams;
  const [samples, pendingPosts, newNoms, totals, liveSpotlights, recent, pendingList] = await Promise.all([
    sampleCounts(db),
    db.$count(posts, eq(posts.status, "pending")),
    db.$count(nominations, eq(nominations.status, "new")),
    db
      .select({
        all: count(),
        hidden: sql<number>`count(*) filter (where ${graduates.isHidden})`,
        claimed: sql<number>`count(*) filter (where ${graduates.profileClaimedAt} is not null)`,
        withPhoto: sql<number>`count(*) filter (where ${graduates.photoUrl} is not null)`,
        noEmail: sql<number>`count(*) filter (where ${graduates.email} is null)`,
      })
      .from(graduates)
      .where(eq(graduates.isSample, false)),
    db.$count(spotlights, eq(spotlights.isPublished, true)),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(12),
    db
      .select({ id: posts.id, title: posts.title, createdAt: posts.updatedAt, author: graduates.fullName })
      .from(posts)
      .leftJoin(graduates, eq(posts.authorGraduateId, graduates.id))
      .where(eq(posts.status, "pending"))
      .orderBy(posts.updatedAt)
      .limit(6),
  ]);
  const t = totals[0];

  return (
    <>
      <AdminHeader
        title={`Hello, ${admin.name.split(" ")[0]}.`}
        sub="Here's what needs your attention."
        actions={
          <>
            <ButtonLink href="/admin/spotlights/new" size="sm">
              New Spotlight
            </ButtonLink>
            <ButtonLink href="/admin/posts/new" size="sm" variant="secondary">
              New post
            </ButtonLink>
          </>
        }
      />
      {denied && <p className="mb-6 rounded-[8px] bg-red-tint px-4 py-3 text-sm font-bold text-red">That area needs a super-admin account.</p>}
      {samplesMsg && (
        <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">
          {samplesMsg === "loaded" ? "Sample content loaded — look around the public site." : "Sample content removed. Only real content remains."}
        </p>
      )}

      <section className={samples.total ? "mb-6 rounded-[12px] border-2 border-amber bg-amber-tint p-5" : "mb-6 rounded-[12px] border border-dashed border-line bg-white p-5"}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-extrabold">{samples.total ? "Demo mode: sample content is live on the site" : "Presenting the platform?"}</p>
            <p className="mt-1 max-w-2xl text-sm text-slate">
              {samples.total
                ? `${samples.spotlights} Spotlight stories, ${samples.posts} Insights posts and ${samples.graduates} sample profiles are showing, each marked “Sample”. They never count towards graduate totals. Remove them before launch, or once real stories are in.`
                : "Load fictional, clearly-labelled sample Spotlight stories, Insights articles and graduate profiles so you can demo every page. Remove them in one click."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <form action={loadSampleContent}>
              <ConfirmButton message={samples.total ? "Reload sample content (resets any edits to samples)?" : "Add sample content to the public site?"} className="h-10 rounded-[4px] bg-ink px-4 text-sm font-bold text-white hover:bg-green-deep">
                {samples.total ? "Reload samples" : "Load sample content"}
              </ConfirmButton>
            </form>
            {samples.total > 0 && (
              <form action={removeSampleContent}>
                <ConfirmButton message="Remove ALL sample content from the site?" className="h-10 rounded-[4px] border border-ink px-4 text-sm font-bold hover:bg-white">
                  Remove all samples
                </ConfirmButton>
              </form>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Submissions awaiting review" value={pendingPosts} href="/admin/posts?status=pending" tone={pendingPosts ? "alert" : "default"} />
        <StatCard label="New Spotlight nominations" value={newNoms} href="/admin/nominations" tone={newNoms ? "alert" : "default"} />
        <StatCard label="Graduates on register" value={Number(t.all)} href="/admin/graduates" />
        <StatCard label="Live Spotlight stories" value={liveSpotlights} href="/admin/spotlights" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Review queue" actions={<Link href="/admin/posts?status=pending" className="text-sm font-bold text-green-deep">All →</Link>}>
          {pendingList.length === 0 ? (
            <p className="text-slate">Nothing waiting. 🎉</p>
          ) : (
            <ul className="divide-y divide-line">
              {pendingList.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.title}</p>
                    <p className="text-sm text-slate">
                      {p.author ?? "Staff"} · submitted {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <ButtonLink href={`/admin/posts/${p.id}`} size="sm" variant="secondary">
                    Review
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Directory health">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Profiles claimed", Number(t.claimed)],
              ["With a photo", Number(t.withPhoto)],
              ["Hidden from public", Number(t.hidden)],
              ["No email on file", Number(t.noEmail)],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-[8px] bg-sand p-4">
                <dt className="font-bold text-slate">{k}</dt>
                <dd className="mt-1 text-2xl font-black">{(v as number).toLocaleString("en-GB")}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-slate">
            {claimPct(Number(t.claimed), Number(t.all))} of graduates have claimed their profile. Share{" "}
            <code className="rounded bg-sand px-1">/claim</code> in class groups to grow this.
          </p>
        </Panel>
      </div>

      <Panel title="Recent activity" className="mt-6">
        {recent.length === 0 ? (
          <p className="text-slate">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>
                  <Badge>{r.actor}</Badge> <span className="font-bold">{r.action}</span> {r.target && <span className="text-slate">{r.target}</span>}
                </span>
                <span className="text-slate">{formatDate(r.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

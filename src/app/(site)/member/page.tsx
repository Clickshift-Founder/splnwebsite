import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CheckCircle2, Circle, ExternalLink, PenLine, Sparkles } from "lucide-react";
import { db } from "@/db";
import { graduates, posts } from "@/db/schema";
import { MemberShell } from "@/components/site/member-shell";
import { Avatar, Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { requireMember } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { POST_STATUS } from "@/lib/brand";
import { withdrawPost } from "./actions";
import { SITE } from "@/content/site";

export const metadata: Metadata = { title: "My SPLN", robots: { index: false } };

export default async function MemberDashboard({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const me = await requireMember();
  const { submitted } = await searchParams;
  const [[g], mine] = await Promise.all([
    db.select().from(graduates).where(eq(graduates.id, me.id)),
    db.select().from(posts).where(eq(posts.authorGraduateId, me.id)).orderBy(desc(posts.updatedAt)),
  ]);

  const checklist = [
    { done: !!g.photoUrl, label: "Add a profile photo" },
    { done: !!g.headline, label: "Add your current role" },
    { done: !!g.bio, label: "Write a short bio" },
    { done: !!(g.linkedinUrl || g.xUrl || g.facebookUrl), label: "Link a social profile" },
  ];
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <MemberShell title={`Welcome home, ${g.fullName.split(" ")[0]}.`} active="/member">
      {submitted && (
        <div className="mb-8 flex items-start gap-3 rounded-[12px] bg-green-tint p-5 text-green-deep">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>
            <strong>Submitted for review.</strong> The SPLN editorial team will check it against SPPG&apos;s standards. You&apos;ll see the status change here.
          </p>
        </div>
      )}
      {g.isHidden && (
        <div className="mb-8 rounded-[12px] bg-amber-tint p-5 text-sm text-[#7a4f00]">
          Your profile is currently not listed in the public directory. Contact the SPLN Secretariat if you&apos;d like it to be visible.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <div className="rounded-[16px] border border-line p-6">
            <div className="flex items-center gap-4">
              <Avatar name={g.fullName} src={g.photoUrl} size={64} />
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold">{g.fullName}</p>
                <p className="truncate text-sm text-slate">{g.headline ?? "Add your current role"}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm font-bold">
                <span>Profile strength</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
                <div className="tile-gradient h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <ul className="mt-5 space-y-2.5">
                {checklist.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    {c.done ? <CheckCircle2 className="size-4 text-green" /> : <Circle className="size-4 text-line" />}
                    <span className={c.done ? "text-slate line-through" : "font-semibold"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href="/member/profile" size="sm">
                Edit profile
              </ButtonLink>
              <ButtonLink href={`/graduates/${g.slug}`} size="sm" variant="secondary">
                View public profile <ExternalLink className="size-3.5" />
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-[16px] bg-night p-6 text-white">
            <Sparkles className="size-5 text-amber" />
            <p className="mt-3 text-lg font-extrabold">Have news to share?</p>
            <p className="mt-1 text-sm text-white/70">Launched something, won a primary, took up an appointment? Nominate yourself or a classmate for the Spotlight.</p>
            <ButtonLink href="/spotlight#nominate" size="sm" variant="light" className="mt-4">
              Share a Spotlight story
            </ButtonLink>
          </div>

          <div className="rounded-[16px] border border-line p-6">
            <p className="text-lg font-extrabold">Mentor the next class</p>
            <p className="mt-1 text-sm text-slate">PeerBridge pairs every new SPPG student with a graduate who has walked the path. 5+ years of leadership experience required.</p>
            <ButtonLink href={SITE.mentorPath} size="sm" variant="secondary" className="mt-4" arrow>
              Become a PeerBridge mentor
            </ButtonLink>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-extrabold">My writing</h2>
            <ButtonLink href="/member/write" size="sm">
              <PenLine className="size-4" /> New article
            </ButtonLink>
          </div>
          {mine.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Your ideas belong here."
                body="Write an article or thought-leadership piece. Every submission is reviewed against SPPG's standards of evidence before publication."
                action={<ButtonLink href="/write" variant="secondary" arrow>Read the guidelines</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-line rounded-[16px] border border-line">
              {mine.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Badge accent={POST_STATUS[p.status].accent}>{POST_STATUS[p.status].label}</Badge>
                    <p className="mt-2 font-extrabold">{p.title}</p>
                    <p className="text-sm text-slate">Updated {formatDate(p.updatedAt)}</p>
                    {p.reviewNote && ["changes_requested", "rejected"].includes(p.status) && (
                      <p className="mt-3 rounded-[8px] bg-sand p-3 text-sm">
                        <strong>{p.status === "changes_requested" && p.publishedAt ? "Unpublished by the editors:" : "Editor's note:"}</strong> {p.reviewNote}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {p.status === "published" ? (
                      <Link href={`/insights/${p.slug}`} className="text-sm font-bold text-green-deep hover:underline">
                        View
                      </Link>
                    ) : (
                      <Link href={`/member/write/${p.id}`} className="text-sm font-bold text-green-deep hover:underline">
                        {p.status === "rejected" ? "Revise" : "Edit"}
                      </Link>
                    )}
                    {p.status === "pending" && (
                      <form action={withdrawPost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-sm font-bold text-slate hover:text-red">Withdraw</button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MemberShell>
  );
}

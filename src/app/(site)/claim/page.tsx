import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ShieldCheck, Lock, UserRoundCheck } from "lucide-react";
import { db } from "@/db";
import { graduates } from "@/db/schema";
import { Avatar, FrameBar } from "@/components/ui/primitives";
import { getMember } from "@/lib/auth";
import { SITE } from "@/content/site";
import { ClaimForm } from "./claim-form";
import { safeNext } from "@/lib/text";

export const metadata: Metadata = { title: "Graduate sign in", robots: { index: false } };

type SP = Promise<{ profile?: string; next?: string }>;

export default async function ClaimPage({ searchParams }: { searchParams: SP }) {
  const { profile, next } = await searchParams;
  const member = await getMember();

  const [target] = profile
    ? await db.select({ slug: graduates.slug, fullName: graduates.fullName, photoUrl: graduates.photoUrl, id: graduates.id }).from(graduates).where(eq(graduates.slug, profile))
    : [];

  // Already signed in as this person (or no specific profile) → straight through.
  if (member && (!target || target.id === member.id)) redirect(safeNext(next));

  return (
    <section className="grain relative min-h-dvh overflow-hidden bg-night pb-20 pt-36 text-white md:pt-44">
      <div className="absolute -right-32 top-10 size-[30rem] rounded-full bg-green/20 blur-3xl" aria-hidden />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_480px] lg:gap-20">
        <div>
          <p className="eyebrow text-white/70">Graduate sign in</p>
          <FrameBar className="mt-4" />
          <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-0.03em] md:text-6xl">
            {target ? (
              <>
                Is this <span className="text-tile-gradient">your</span> profile?
              </>
            ) : (
              <>
                Welcome back, <span className="text-tile-gradient">graduate.</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            No passwords to remember. Enter the email address you registered with at SPPG and we&apos;ll send you a one-time code. Only the owner of that inbox can edit a profile.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              { Icon: UserRoundCheck, t: "Edit your profile", b: "Photo, current role, bio, location and your X, LinkedIn and Facebook links." },
              { Icon: ShieldCheck, t: "Write for SPLN", b: "Submit articles and thought leadership for editorial review." },
              { Icon: Lock, t: "Private stays private", b: "Your email, phone and matric number are never shown publicly." },
            ].map(({ Icon, t, b }) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
                  <Icon className="size-5 text-green" />
                </span>
                <div>
                  <p className="font-extrabold">{t}</p>
                  <p className="text-white/65">{b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[16px] bg-white p-6 text-ink shadow-2xl md:p-8">
          {next === SITE.mentorPath && (
            <p className="mb-6 rounded-[8px] bg-blue-tint p-4 text-sm font-semibold text-ink">
              PeerBridge mentoring is open to SPPG graduates only. Verify with your registered email to continue to the mentor registration form.
            </p>
          )}
          {target && (
            <div className="mb-6 flex items-center gap-4 border-b border-line pb-6">
              <Avatar name={target.fullName} src={target.photoUrl} size={56} />
              <div>
                <p className="text-sm font-semibold text-slate">Editing profile</p>
                <p className="text-lg font-extrabold">{target.fullName}</p>
              </div>
            </div>
          )}
          <ClaimForm profile={target?.slug} next={next ?? (target ? "/member/profile" : undefined)} />
          <p className="mt-6 border-t border-line pt-5 text-sm text-slate">
            Email changed or no longer accessible? Contact the Secretariat at{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="font-bold text-green-deep underline underline-offset-2">
              {SITE.contactEmail}
            </a>
            . Not a graduate yet?{" "}
            <Link href="/join" className="font-bold text-green-deep underline underline-offset-2">
              Here&apos;s how to join
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

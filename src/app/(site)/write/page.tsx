import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, FileSearch, Megaphone, PenLine, Send } from "lucide-react";
import { ButtonLink, FrameBar, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { DECLARATIONS, WRITING_STANDARDS } from "@/content/site";
import { getMember } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Write for SPLN",
  description: "How SPPG graduates publish articles and thought leadership on SPLN Insights — and the SPPG standard of evidence every piece must meet.",
};

const PROCESS = [
  { Icon: PenLine, t: "Draft", b: "Sign in with your registered email and write in the SPLN editor. Save drafts as often as you like." },
  { Icon: ClipboardCheck, t: "Declare", b: "List your sources and confirm the five editorial declarations — evidence, accuracy, non-partisanship, originality, editing." },
  { Icon: FileSearch, t: "Review", b: "The SPLN editorial team checks facts against your sources, tests the argument and screens for partisanship. Typical turnaround: under a week." },
  { Icon: Send, t: "Publish", b: "Approved pieces go live on SPLN Insights with your verified byline and are linked from your directory profile." },
  { Icon: Megaphone, t: "Amplify", b: "Strong pieces are shared across SPLN and SPPG channels and may be featured on the homepage." },
];

const FORMATS = [
  { t: "Articles", len: "800–1,800 words", b: "Analysis, explainers and case studies of policy and governance — what happened, why, and what it means." },
  { t: "Thought leadership", len: "800–1,500 words", b: "An argued perspective on how Africa should be governed — a clear position, built on evidence, with practical proposals." },
  { t: "Practice notes", len: "600–1,200 words", b: "Lessons from inside public office or a campaign — what you met, what you did differently, what changed." },
];

export default async function WritePage() {
  const member = await getMember();
  const cta = member ? { href: "/member/write", label: "Start writing" } : { href: "/claim?next=/member/write", label: "Sign in to write" };

  return (
    <>
      <PageHero
        eyebrow="Write for SPLN"
        title={
          <>
            Evidence first. <span className="text-tile-gradient">Then argue boldly.</span>
          </>
        }
        lead="SPLN Insights publishes graduates of the School of Politics, Policy & Governance. Every piece is reviewed by the SPLN editorial team against SPPG's standard: verified data, cited sources, non-partisan analysis."
      >
        <ButtonLink href={cta.href} variant="light" size="lg" arrow>
          {cta.label}
        </ButtonLink>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="The SPPG standard" title="Six rules every piece must meet." lead="These are the questions our editors ask of every submission. Ask them of your own draft first." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WRITING_STANDARDS.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 70}>
                <div className="h-full rounded-[16px] border border-line p-6">
                  <p className="text-4xl font-black text-green">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 text-xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="How it works" title="From draft to published." />
            <ol className="mt-10 space-y-6">
              {PROCESS.map(({ Icon, t, b }, i) => (
                <li key={t} className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line">
                    <Icon className="size-5 text-green-deep" />
                  </span>
                  <div>
                    <p className="text-lg font-extrabold">
                      {i + 1}. {t}
                    </p>
                    <p className="mt-1 text-slate">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-6">
            <div className="rounded-[16px] bg-white p-6 md:p-8">
              <p className="eyebrow text-slate">What we publish</p>
              <FrameBar className="mt-3" />
              <div className="mt-6 divide-y divide-line">
                {FORMATS.map((f) => (
                  <div key={f.t} className="py-4 first:pt-0 last:pb-0">
                    <p className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-lg font-extrabold">{f.t}</span>
                      <span className="text-sm font-bold text-green-deep">{f.len}</span>
                    </p>
                    <p className="mt-1 text-slate">{f.b}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] bg-night p-6 text-white md:p-8">
              <p className="text-lg font-extrabold">Before you submit, you&apos;ll confirm:</p>
              <ul className="mt-4 space-y-3">
                {DECLARATIONS.map((d) => (
                  <li key={d} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Good sources" title="What counts as evidence?" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] border border-line p-6">
              <p className="font-extrabold text-green-deep">Strong</p>
              <ul className="mt-3 space-y-2 text-sm text-slate">
                <li>National statistics bureaux and central banks</li>
                <li>Budgets, gazettes, laws and court judgments</li>
                <li>Electoral commission results</li>
                <li>Peer-reviewed research</li>
                <li>AU, UN, World Bank, IMF, AfDB data</li>
                <li>Reputable newsrooms, with dates</li>
              </ul>
            </div>
            <div className="rounded-[16px] border border-line p-6">
              <p className="font-extrabold text-red">Not on their own</p>
              <ul className="mt-3 space-y-2 text-sm text-slate">
                <li>Unattributed social-media posts or screenshots</li>
                <li>Forwarded WhatsApp messages</li>
                <li>Partisan press releases without corroboration</li>
                <li>Undated or unsourced infographics</li>
                <li>AI-generated statistics you haven&apos;t verified</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container-x mt-14 text-center">
          <ButtonLink href={cta.href} size="lg" arrow>
            {cta.label}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

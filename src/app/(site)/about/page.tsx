import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, Network, Compass, Landmark } from "lucide-react";
import { ButtonLink, FrameBar, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { MISSION, PILLARS, PLEDGE, STORY, THREE_CS, TIMELINE, VALUES, VISION } from "@/content/site";
import { ACCENT_BG, cn } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About SPLN",
  description: "The story, vision, pillars and values of the SPPG Public Leaders Network — the lifelong community of graduates of the School of Politics, Policy & Governance.",
};

const ICONS = { GraduationCap, Network, Compass, Landmark };
const ACCENTS = ["green", "blue", "red", "amber"] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About SPLN"
        image="/images/gallery/ng-2022/01.jpg"
        title={
          <>
            Graduating <span className="text-tile-gradient">into</span> something — not out of it.
          </>
        }
        lead="The SPPG Public Leaders Network is the lifelong, co-managed community of graduates of the School of Politics, Policy & Governance — a pillar of the #FixPolitics initiative founded by Dr Obiageli “Oby” Ezekwesili."
      />

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Our story" title="Every class asked the same question on the way out: what happens next?" />
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-slate">
            <p>{STORY.origin}</p>
            <p>{STORY.problem}</p>
            <p className="font-semibold text-ink">{STORY.answer}</p>
            <p>{STORY.howItRuns}</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-sand py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Milestones" title="From a Berlin convening to a pan-African network." />
          <ol className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((t, i) => (
              <Reveal as="li" key={t.year} delay={(i % 4) * 70} className="relative border-t-2 border-line pt-6">
                <span className={cn("absolute -top-[5px] left-0 size-2.5 rounded-full", ACCENT_BG[ACCENTS[i % 4]])} />
                <p className="text-2xl font-black tracking-tight">{t.year}</p>
                <p className="mt-2 text-slate">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="grain relative overflow-hidden bg-night py-16 text-white md:py-24">
        <div className="absolute -left-40 top-0 size-[32rem] rounded-full bg-green/15 blur-[120px]" aria-hidden />
        <div className="container-x relative grid gap-10 md:grid-cols-2">
          {[
            { k: "Vision", v: VISION },
            { k: "Mission", v: MISSION },
          ].map((x) => (
            <div key={x.k} className="rounded-[16px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
              <p className="eyebrow text-white/60">{x.k}</p>
              <FrameBar className="mt-3" />
              <p className="mt-6 text-xl font-semibold leading-relaxed md:text-2xl">{x.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3Cs */}
      <section className="py-16 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
            <Image src="/images/grad-cert.jpg" alt="An SPPG graduate holding their certificate" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow="Our defining framework" title="Character. Competence. Capacity." lead="The three Cs shape everything in the SPPG ecosystem — from who is admitted, to how they're taught, to who is inducted into SPLN." />
            <div className="mt-8 space-y-4">
              {THREE_CS.map((c) => (
                <div key={c.key} className="flex gap-4 rounded-[12px] border border-line p-5">
                  <span className={cn("w-1.5 shrink-0 rounded-full", ACCENT_BG[c.color])} />
                  <div>
                    <p className="text-lg font-extrabold">{c.key}</p>
                    <p className="text-slate">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-sand py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="What SPLN exists to do" title="Four pillars." lead="SPLN is not just a network. It's a launchpad — a place where SPPG graduates are equipped, inspired and connected to lead boldly in public life." />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PILLARS.map((p, i) => {
              const Icon = ICONS[p.icon];
              return (
                <Reveal key={p.title} delay={(i % 2) * 80}>
                  <div className="h-full rounded-[16px] bg-white p-7 md:p-8">
                    <span className={cn("grid size-12 place-items-center rounded-[12px] text-white", ACCENT_BG[ACCENTS[i]])}>
                      <Icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold md:text-2xl">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Our values" title="What we hold each other to." lead="SPLN is proudly non-partisan. We respect every member's party affiliation, and take no political side." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v, i) => (
              <div key={v.title} className="rounded-[16px] border border-line p-6">
                <span className={cn("block h-1 w-8 rounded-full", ACCENT_BG[ACCENTS[i % 4]])} />
                <p className="mt-4 text-lg font-extrabold leading-tight">{v.title}</p>
                <p className="mt-2 text-sm text-slate">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pledge */}
      <section id="pledge" className="relative scroll-mt-20 overflow-hidden bg-night text-white">
        <Image src="/images/sn-class-wide.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/90 to-night" />
        <div className="container-x relative max-w-4xl py-20 text-center md:py-28">
          <p className="eyebrow text-white/60">The SPPG Graduation Pledge</p>
          <FrameBar className="mx-auto mt-4" />
          <p className="mt-8 text-lg text-white/80 md:text-xl">{PLEDGE.intro}</p>
          <ul className="mt-8 space-y-4 text-left md:text-center">
            {PLEDGE.lines.map((l) => (
              <li key={l} className="text-xl font-bold leading-snug md:text-2xl">
                {l}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.2em] text-green">This we pledge</p>
          <p className="mt-3 text-2xl font-black md:text-3xl">{PLEDGE.close.join(" ")}</p>
          <ButtonLink href="/join" variant="light" arrow className="mt-10">
            Take the pledge — join the next class
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

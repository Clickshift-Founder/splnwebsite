import type { Metadata } from "next";
import Image from "next/image";
import { Check, Users } from "lucide-react";
import { Badge, ButtonLink, FrameBar, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { COMMITTEE_RULES, COMMITTEES, LEADERSHIP, PEERBRIDGE, SECTORS, SITE, STRUCTURE } from "@/content/site";
import { ACCENT_BG, cn } from "@/lib/brand";

export const metadata: Metadata = {
  title: "How the network works",
  description: "SPLN's structure, leadership, working committees, working sectors and PeerBridge mentorship.",
};

const ACCENTS = ["green", "blue", "red", "amber", "green"] as const;

export default function NetworkPage() {
  return (
    <>
      <PageHero
        eyebrow="The Network"
        image="/images/sn-class-wide.jpg"
        title={
          <>
            Co&#8209;managed. Co&#8209;created. <span className="text-tile-gradient">Built to last.</span>
          </>
        }
        lead="SPLN is run jointly by SPPG and its graduates — with a structure that keeps a pan-African network personal, and a committee system that turns members into leaders."
      />

      {/* Structure — concentric layers */}
      <section className="py-16 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Structure" title="Five layers, one community." lead="Every member belongs to several layers at once — so whether you need a continent-wide conversation or a coffee with your classmates, there's a space for it. Each layer is moderated by coordinators working with the SPLN Secretariat." />
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {LEADERSHIP.map((l) => (
                <div key={l.role} className="rounded-[12px] border border-line p-4">
                  <p className="font-extrabold leading-tight">{l.role}</p>
                  <p className="mt-1.5 text-sm text-slate">{l.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            {STRUCTURE.map((s, i) => {
              const inset = i * 10;
              return (
                <div
                  key={s.level}
                  className="group absolute rounded-full border-2 transition-colors"
                  style={{ inset: `${inset}%`, borderColor: ["#05AF4B", "#009CD9", "#D80A15", "#F2A421", "#1A1A1A"][i], background: i === 4 ? "#0e1512" : "transparent" }}
                >
                  <span
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-wider shadow-sm sm:text-xs"
                    style={{ color: ["#05893C", "#0079a8", "#D80A15", "#a86a00", "#1A1A1A"][i] }}
                  >
                    {s.level}
                  </span>
                </div>
              );
            })}
            <div className="absolute inset-[40%] grid place-items-center rounded-full text-center">
              <p className="px-2 text-xs font-extrabold leading-tight text-white sm:text-sm">Graduates in Public Office</p>
            </div>
          </div>
        </div>
        <div className="container-x mt-14 grid gap-4 md:grid-cols-5">
          {STRUCTURE.map((s, i) => (
            <Reveal key={s.level} delay={i * 60}>
              <div className="h-full rounded-[16px] border border-line p-5">
                <span className={cn("block h-1 w-8 rounded-full", i === 4 ? "bg-ink" : ACCENT_BG[ACCENTS[i]])} />
                <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-slate">{s.level}</p>
                <p className="mt-1 font-extrabold leading-tight">{s.title}</p>
                <p className="mt-2 text-sm text-slate">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Committees */}
      <section id="committees" className="grain relative scroll-mt-20 overflow-hidden bg-night py-16 text-white md:py-24">
        <div className="container-x relative">
          <SectionHeading dark eyebrow="Working committees" title="Leadership platforms, not honorary titles." lead="Each committee owns a thematic area, sets an annual workplan and reports back to the community." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {COMMITTEES.map((c, i) => (
              <Reveal key={c.name} delay={i * 60}>
                <div className="flex h-full flex-col rounded-[16px] border border-white/10 bg-white/[0.04] p-6">
                  <span className={cn("block h-1 w-10 rounded-full", ACCENT_BG[ACCENTS[i]])} />
                  <p className="mt-5 text-lg font-extrabold leading-snug">{c.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{c.body}</p>
                  <div className="mt-auto border-t border-white/10 pt-4">
                    <p className="text-[0.7rem] font-extrabold uppercase tracking-wider text-white/45">{"leadLabel" in c ? c.leadLabel : c.leads.length > 1 ? "Leads" : "Lead"}</p>
                    <ul className="mt-1.5 space-y-0.5 text-sm font-bold text-white/90">
                      {c.leads.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <ul className="mt-10 grid gap-3 md:grid-cols-2">
            {COMMITTEE_RULES.map((r) => (
              <li key={r} className="flex gap-3 text-white/80">
                <Check className="mt-1 size-4 shrink-0 text-green" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHeading
            eyebrow="Working sectors"
            title="Plug in where your path is."
            lead="Distinct from committees (one per member, leadership-focused), working sectors are open interest groups. Join any that fit the way you serve."
          />
          <div className="flex flex-wrap content-start gap-3">
            {SECTORS.map((s, i) => (
              <span key={s} className={cn("rounded-full border-2 px-5 py-3 text-lg font-extrabold", ["border-green", "border-blue", "border-red", "border-amber"][i % 4])}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PeerBridge */}
      <section id="peerbridge" className="scroll-mt-20 bg-sand py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Badge accent="blue" className="px-3 py-1">
              <Users className="size-3.5" /> PeerBridge Mentorship
            </Badge>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-5xl">Every new student, matched with a graduate who&apos;s walked the path.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate">{PEERBRIDGE.why}</p>
            <ul className="mt-8 space-y-2.5">
              {PEERBRIDGE.outcomes.map((o) => (
                <li key={o} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-green" /> {o}
                </li>
              ))}
            </ul>
            <a href={SITE.mentorApplyUrl} target="_blank" rel="noopener noreferrer" className="group relative mt-10 block aspect-square max-w-md overflow-hidden rounded-[16px] ring-1 ring-line">
              <Image src={PEERBRIDGE.mentorImage} alt="SPPG PeerBridge Mentorship Programme — register to become a PeerBridge mentor" fill sizes="(min-width: 1024px) 28rem, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            </a>
          </div>
          <div className="space-y-6">
            <div className="rounded-[16px] bg-white p-7 md:p-8">
              <p className="eyebrow text-slate">How it runs</p>
              <FrameBar className="mt-3" />
              <ol className="mt-6 space-y-4">
                {PEERBRIDGE.phases.map((p, i) => (
                  <li key={p} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sand text-sm font-black">{i + 1}</span>
                    <span className="pt-1">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-[16px] bg-night p-7 text-white md:p-8">
              <p className="text-2xl font-extrabold">Become a mentor</p>
              <p className="mt-3 leading-relaxed text-white/70">{PEERBRIDGE.mentorAsk}</p>
              <ButtonLink href={SITE.mentorApplyUrl} variant="light" arrow className="mt-6">
                Register as a mentor
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

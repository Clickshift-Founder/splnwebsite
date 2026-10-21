import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Landmark, ShieldCheck } from "lucide-react";
import { SpotlightCard } from "@/components/site/cards";
import { EmptyState, FrameBar, PageHero } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { SPOTLIGHT_CATEGORIES, SPOTLIGHT_SERIES } from "@/content/site";
import { cn } from "@/lib/brand";
import { getMember } from "@/lib/auth";
import { getSpotlightCategoriesInUse, listSpotlights } from "@/lib/queries";
import { NominationForm } from "./nomination-form";

export const metadata: Metadata = {
  title: "Spotlight",
  description: "What SPPG graduates are building — ventures launched, primaries won, appointments taken and reforms delivered across Africa.",
};
export const revalidate = 300;

export default async function SpotlightPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [items, inUse, member] = await Promise.all([listSpotlights({ category, limit: 60 }), getSpotlightCategoriesInUse(), getMember()]);
  const [lead, ...rest] = items;

  return (
    <>
      <PageHero
        eyebrow="Spotlight"
        image="/images/ke-embrace.jpg"
        title={
          <>
            The network, <span className="text-tile-gradient">in motion.</span>
          </>
        }
        lead="Ventures launched. Primaries won. Appointments taken. Reforms delivered. These are the stories of SPPG graduates putting Character, Competence and Capacity to work."
      />

      <section className="py-14 md:py-20">
        <div className="container-x">
          {inUse.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              <Chip href="/spotlight" active={!category}>
                All stories
              </Chip>
              {SPOTLIGHT_CATEGORIES.filter((c) => inUse.some((u) => u.category === c)).map((c) => (
                <Chip key={c} href={`/spotlight?category=${encodeURIComponent(c)}`} active={category === c}>
                  {c}
                </Chip>
              ))}
            </div>
          )}

          {lead ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <SpotlightCard s={lead} large />
              </Reveal>
              {rest.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 70}>
                  <SpotlightCard s={s} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title={category ? `No ${category} stories yet` : "The first stories are being written"}
              body="Spotlight stories are curated by the SPLN team with each graduate's consent. Know someone who belongs here? Nominate them below."
            />
          )}
        </div>
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">
              <Landmark className="size-3.5" /> Spotlight Series
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">{SPOTLIGHT_SERIES.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate">{SPOTLIGHT_SERIES.body}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {SPOTLIGHT_SERIES.safeguards.map((s) => (
                <li key={s} className="flex gap-2.5 rounded-[12px] border border-line bg-white p-4 text-sm font-semibold">
                  <ShieldCheck className="size-5 shrink-0 text-green" /> {s}
                </li>
              ))}
            </ul>
            <div className="relative mt-8 hidden aspect-[16/9] overflow-hidden rounded-[16px] lg:block">
              <Image src="/images/afcon-group.jpg" alt="SPPG leadership and partners at the Africa Conference" fill sizes="50vw" className="object-cover" />
            </div>
          </div>

          <div id="nominate" className="scroll-mt-28 rounded-[16px] bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,21,18,0.4)] md:p-10">
            <p className="eyebrow text-slate">Nominate a graduate</p>
            <FrameBar className="mt-3" />
            <h3 className="mt-5 text-2xl font-extrabold md:text-3xl">Who should the network hear about?</h3>
            <p className="mt-2 text-slate">
              Peer nominations and self-nominations are both welcome. We verify every story and ask the graduate&apos;s consent before publishing.
            </p>
            <div className="mt-8">
              <NominationForm defaultName={member?.fullName} />
            </div>
            {!member && (
              <p className="mt-6 text-sm text-slate">
                Graduates:{" "}
                <Link href="/claim?next=/spotlight%23nominate" className="font-bold text-green-deep underline underline-offset-2">
                  sign in
                </Link>{" "}
                first so we know the nomination comes from inside the network.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn("rounded-full px-4 py-2 text-sm font-bold transition-colors", active ? "bg-ink text-white" : "border border-line hover:border-ink/40")}
    >
      {children}
    </Link>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink, FrameBar, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { CountUp, Reveal } from "@/components/ui/motion";
import { AfricaMap } from "@/components/site/africa-map";
import { ACCENT_BG, ACCENT_TEXT, cn, countryAccent } from "@/lib/brand";
import { formatDate } from "@/lib/text";
import { getNetworkTotals, getStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Impact",
  description: "SPPG graduates in numbers: graduates by country and class, aspirants, candidates, and graduates appointed and elected to public office.",
};
export const revalidate = 300;

export default async function ImpactPage() {
  const [totals, office, network] = await Promise.all([getNetworkTotals(), getStats("public_office"), getStats("network")]);
  const max = Math.max(...totals.countries.flatMap((c) => c.cohorts.map((k) => k.graduates)), 1);
  const updated = [...office, ...network].reduce<Date | null>((d, s) => (!d || s.updatedAt > d ? s.updatedAt : d), null);

  return (
    <>
      <PageHero
        eyebrow="Impact"
        image="/images/grad-audience.jpg"
        title={
          <>
            Run to win. <span className="text-tile-gradient">Govern good.</span>
          </>
        }
        lead="SPPG doesn't end at graduation — it begins there. These numbers are maintained by the SPLN Secretariat and the graduate register, and update as the network grows."
      />

      {/* Headline numbers */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { v: totals.graduates, l: "SPPG graduates", s: "on the verified register", a: "green" as const },
              { v: totals.cohorts, l: "Graduating classes", s: `across ${totals.countriesWithGraduates} countries`, a: "blue" as const },
              { v: totals.countries.length, l: "Countries", s: `growing to ${network.find((n) => n.key === "countries_goal")?.value ?? 20}`, a: "amber" as const },
            ].map((x) => (
              <div key={x.l} className="relative overflow-hidden rounded-[16px] border border-line p-8">
                <span className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BG[x.a])} />
                <p className={cn("text-6xl font-black tracking-tight md:text-7xl", ACCENT_TEXT[x.a])}>
                  <CountUp value={x.v} />
                </p>
                <p className="mt-3 text-xl font-extrabold">{x.l}</p>
                <p className="text-slate">{x.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public office */}
      <section className="grain relative overflow-hidden bg-night py-16 text-white md:py-24">
        <div className="container-x relative">
          <SectionHeading dark eyebrow="Graduates in public life" title="Declaring. Contesting. Winning. Serving." lead="Across the 2023–2027 electoral cycle and in appointed office — across parties and across borders." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {office.map((s, i) => (
              <Reveal key={s.key} delay={i * 70}>
                <div className="h-full rounded-[16px] border border-white/10 bg-white/[0.04] p-7">
                  <span className={cn("block h-1 w-10 rounded-full", ACCENT_BG[(["green", "blue", "red", "amber"] as const)[i % 4]])} />
                  <p className="mt-6 text-6xl font-black tracking-tight">
                    <CountUp value={s.value} suffix={s.suffix ?? ""} />
                  </p>
                  <p className="mt-2 text-lg font-extrabold">{s.label}</p>
                  {s.detail && <p className="mt-1 text-sm text-white/60">{s.detail}</p>}
                </div>
              </Reveal>
            ))}
          </div>
          {updated && <p className="mt-6 text-sm text-white/45">Figures last updated {formatDate(updated)} by the SPLN Secretariat.</p>}
          <ButtonLink href="/graduates?office=any" variant="light" arrow className="mt-8">
            Meet graduates in public life
          </ButtonLink>
        </div>
      </section>

      {/* By country & class */}
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Growing every year" title="Graduates by country and class." />
            <div className="mt-10 space-y-10">
              {totals.countries.map((c, ci) => (
                <div key={c.code}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <p className="flex items-center gap-2 text-xl font-extrabold">
                      <Flag code={c.code} emoji={c.flag} /> {c.name}
                    </p>
                    <p className={cn("font-black", ACCENT_TEXT[countryAccent(c.code, ci)])}>
                      {c.graduates > 0 ? `${c.graduates.toLocaleString("en-GB")} graduates` : "Admissions in progress"}
                    </p>
                  </div>
                  {c.cohorts.some((k) => k.graduates > 0) && (
                    <ul className="mt-4 space-y-2.5">
                      {c.cohorts
                        .filter((k) => k.graduates > 0)
                        .map((k) => (
                          <li key={k.id} className="grid grid-cols-[140px_1fr_48px] items-center gap-3 text-sm sm:grid-cols-[180px_1fr_56px]">
                            <span className="font-bold">{k.name}</span>
                            <span className="h-3 overflow-hidden rounded-full bg-sand">
                              <span className={cn("block h-full rounded-full", ACCENT_BG[countryAccent(c.code, ci)])} style={{ width: `${(k.graduates / max) * 100}%` }} />
                            </span>
                            <span className="text-right font-extrabold tabular-nums">{k.graduates}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                  {c.partner && <p className="mt-3 text-sm text-slate">In partnership with {c.partner}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[16px] bg-night p-6 text-white">
              <AfricaMap countries={totals.countries} className="h-auto w-full" />
            </div>
            <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-[16px]">
              <Image src="/images/ke-flags-crowd.jpg" alt="SPPG Kenya graduates waving Kenyan flags" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand py-16 text-center md:py-20">
        <div className="container-x max-w-2xl">
          <FrameBar className="mx-auto" />
          <h2 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">Be counted in the next class.</h2>
          <p className="mt-4 text-lg text-slate">Join the graduates transforming communities and contesting for public office across Africa.</p>
          <ButtonLink href="/join" size="lg" arrow className="mt-8">
            How to join
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

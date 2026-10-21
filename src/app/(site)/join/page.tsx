import type { Metadata } from "next";
import Image from "next/image";
import { Check, ShieldCheck, Mail } from "lucide-react";
import { Badge, ButtonLink, FrameBar, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { Reveal } from "@/components/ui/motion";
import { GET_INVOLVED, PATH, SITE, THREE_CS } from "@/content/site";
import { ACCENT_BG, cn, countryAccent } from "@/lib/brand";
import { getNetworkTotals } from "@/lib/queries";

export const metadata: Metadata = {
  title: "How to join SPLN",
  description: "There is one way into the SPPG Public Leaders Network: apply to SPPG, be admitted, complete the 10-month programme, graduate and earn the 3Cs attestation.",
};

const WHO = [
  { t: "Future office-holders", b: "From councillors and LGA chairs to legislators, governors and presidents." },
  { t: "Inside government", b: "Policymakers, ministers, special advisers and support staff." },
  { t: "Advisers & consultants", b: "Advising government and civil society on politics and policy." },
  { t: "Private & non-profit", b: "Media, finance, law, health and education professionals who work with government." },
  { t: "Engaged citizens", b: "Advocates who want to become skilled at engaging government." },
];

const MEMBERSHIP = [
  "A verified profile in the public Graduate Directory",
  "Your country group, class group and regional group",
  "A seat on one of five graduate-led working committees",
  "PeerBridge — mentor the next class, or be mentored",
  "Leadership Clinics, workshops and the bi-annual General Meeting",
  "The Graduates in Public Office community, when you serve",
  "A platform for your ideas on SPLN Insights",
  "Lifelong connection to SPPG and 1,300+ public leaders",
];

export default async function JoinPage() {
  const totals = await getNetworkTotals();
  return (
    <>
      <PageHero
        eyebrow="How to join"
        image="/images/gallery/ng-2023/03.jpg"
        title={
          <>
            There is one door into SPLN. <span className="text-tile-gradient">It starts at SPPG.</span>
          </>
        }
        lead="SPLN has no membership form and no fee. Every member was admitted to the School of Politics, Policy & Governance, completed ten demanding months, graduated, and was attested on Character, Competence and Capacity."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={SITE.applyUrl} size="lg" arrow>
            Apply to SPPG
          </ButtonLink>
          <ButtonLink href="#journey" size="lg" variant="ghost-light">
            See the journey
          </ButtonLink>
        </div>
      </PageHero>

      {/* Countries */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Choose your country" title="Admissions are open across four nations." lead="Apply in the country where you live and serve. Each country runs its own selection, cohort and graduation." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {totals.countries.map((c, i) => (
              <div key={c.code} className="relative flex flex-col overflow-hidden rounded-[16px] border border-line p-6">
                <span className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BG[countryAccent(c.code, i)])} />
                <div className="flex items-center justify-between">
                  <Flag code={c.code} emoji={c.flag} className="text-3xl" />
                  {c.admissionsOpen ? <Badge accent="green">Admissions open</Badge> : <Badge>Coming soon</Badge>}
                </div>
                <p className="mt-4 text-2xl font-extrabold">{c.name}</p>
                <p className="mt-1 text-sm text-slate">{c.graduates > 0 ? `${c.graduates.toLocaleString("en-GB")} graduates so far` : "Pioneer class forming now"}</p>
                {c.admissionsEmail && (
                  <a href={`mailto:${c.admissionsEmail}`} className="mt-4 inline-flex items-center gap-1.5 break-all text-sm font-bold text-green-deep hover:underline">
                    <Mail className="size-4 shrink-0" /> {c.admissionsEmail}
                  </a>
                )}
                <ButtonLink href={c.applyUrl ?? SITE.applyUrl} size="sm" className="mt-5 w-full" arrow>
                  Apply in {c.name}
                </ButtonLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="grain relative scroll-mt-20 overflow-hidden bg-night py-16 text-white md:py-24">
        <div className="container-x relative">
          <SectionHeading dark eyebrow="The journey" title="Six steps. No shortcuts." />
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PATH.map((s, i) => (
              <Reveal as="li" key={s.n} delay={(i % 3) * 80}>
                <div className={cn("h-full rounded-[16px] p-7", i === PATH.length - 1 ? "tile-gradient" : "border border-white/10 bg-white/[0.04]")}>
                  <p className={cn("text-5xl font-black", i === PATH.length - 1 ? "text-white/90" : "text-white/25")}>{s.n}</p>
                  <h3 className="mt-4 text-2xl font-extrabold">{s.title}</h3>
                  <p className={cn("mt-2 leading-relaxed", i === PATH.length - 1 ? "text-white/90" : "text-white/70")}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Selectivity + 3Cs */}
      <section className="py-16 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Why it means something"
              title="Selective by design."
              lead="Only a small fraction of applicants are admitted. Graduation demands every module, the Capstone, every peer evaluation and 98% attendance and participation. Then SPPG's Senior Leadership Team must attest each graduate's 3Cs Index stands above the threshold. That's why an SPLN profile is a credential."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {THREE_CS.map((c) => (
                <div key={c.key} className="rounded-[12px] border border-line p-4">
                  <ShieldCheck className={cn("size-5", c.color === "green" ? "text-green" : c.color === "blue" ? "text-blue" : "text-amber")} />
                  <p className="mt-2 font-extrabold">{c.key}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-slate">Who attends SPPG</p>
            <FrameBar className="mt-3" />
            <ul className="mt-6 divide-y divide-line rounded-[16px] border border-line">
              {WHO.map((w, i) => (
                <li key={w.t} className="flex gap-4 p-5">
                  <span className="text-sm font-black text-green">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-extrabold">{w.t}</p>
                    <p className="text-sm text-slate">{w.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What membership gives you */}
      <section className="bg-sand py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-80 overflow-hidden rounded-[16px]">
            <Image src="/images/sn-class-photo.jpg" alt="SPPG Senegal graduates" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow="On the other side" title="What's waiting for you in SPLN." />
            <ul className="mt-8 space-y-3">
              {MEMBERSHIP.map((m) => (
                <li key={m} className="flex gap-3 text-lg">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-green text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div className="rounded-[16px] bg-night p-8 text-white md:p-10">
            <p className="eyebrow text-white/60">Not ready to apply yet?</p>
            <ul className="mt-5 space-y-3">
              {GET_INVOLVED.prospective.map((x) => (
                <li key={x} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-green" /> {x}
                </li>
              ))}
            </ul>
            <ButtonLink href="/spotlight" variant="light" arrow className="mt-8">
              See where SPPG leads
            </ButtonLink>
          </div>
          <div className="rounded-[16px] border border-line p-8 md:p-10">
            <p className="eyebrow text-slate">For partners &amp; institutions</p>
            <ul className="mt-5 space-y-3">
              {GET_INVOLVED.partners.map((x) => (
                <li key={x} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-green" /> {x}
                </li>
              ))}
            </ul>
            <ButtonLink href={`mailto:${SITE.contactEmail}?subject=Partnering with SPLN`} variant="secondary" arrow className="mt-8">
              Talk to the Secretariat
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { GraduateCard } from "@/components/site/cards";
import { EmptyState, FrameBar } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { cn } from "@/lib/brand";
import { getNetworkTotals, listGraduates } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Graduate Directory",
  description: "Verify SPPG graduates across Nigeria, Senegal, Kenya and Ghana. Search by name, country, class or public office.",
};

type SP = Promise<{ q?: string; country?: string; cohort?: string; office?: string; page?: string }>;

const OFFICE_FILTERS = [
  { v: "", label: "Everyone" },
  { v: "any", label: "In public life" },
  { v: "elected", label: "Elected" },
  { v: "appointed", label: "Appointed" },
  { v: "candidate", label: "Candidates" },
  { v: "aspirant", label: "Aspirants" },
];

export default async function GraduatesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters = { q: sp.q, country: sp.country, cohort: sp.cohort, office: sp.office, page: Number(sp.page) || 1 };
  const [totals, result] = await Promise.all([getNetworkTotals(), listGraduates(filters)]);

  const href = (patch: Record<string, string | undefined>) => {
    const next = { q: sp.q, country: sp.country, cohort: sp.cohort, office: sp.office, ...patch };
    if (!("page" in patch)) delete (next as Record<string, unknown>).page;
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/graduates${qs ? `?${qs}` : ""}#results`;
  };

  const countryCohorts = sp.country ? totals.countries.find((c) => c.code === sp.country?.toUpperCase())?.cohorts ?? [] : [];
  const activeCountries = totals.countries.filter((c) => c.graduates > 0);
  const filtered = Boolean(sp.q || sp.country || sp.cohort || sp.office);

  return (
    <>
      <section className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute -right-24 -top-24 size-[30rem] rounded-full bg-green/20 blur-3xl" aria-hidden />
        <div className="container-x relative pb-14 pt-36 md:pb-20 md:pt-44">
          <p className="eyebrow text-white/70">The Graduate Directory</p>
          <FrameBar className="mt-4" />
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.03em] md:text-6xl">
            {totals.graduates.toLocaleString("en-GB")} public leaders.
            <br />
            <span className="text-tile-gradient">One verified register.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/75">
            Every person listed here was admitted to SPPG, completed the ten-month programme, graduated and was attested on Character, Competence and Capacity. Search to confirm a graduate.
          </p>

          <form action="/graduates" className="mt-9 flex max-w-2xl items-center gap-2 rounded-[8px] bg-white p-2 text-ink" role="search">
            {sp.country && <input type="hidden" name="country" value={sp.country} />}
            {sp.cohort && <input type="hidden" name="cohort" value={sp.cohort} />}
            {sp.office && <input type="hidden" name="office" value={sp.office} />}
            <Search className="ml-2 size-5 shrink-0 text-slate" />
            <label htmlFor="q" className="sr-only">
              Search by name, role or location
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q}
              placeholder="Search by name, role or location…"
              className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate/60"
            />
            <button className="h-12 rounded-[4px] bg-green px-6 font-bold text-white hover:bg-green-deep">Search</button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip href={href({ country: undefined, cohort: undefined })} active={!sp.country} dark>
              All countries
            </FilterChip>
            {activeCountries.map((c) => (
              <FilterChip key={c.code} href={href({ country: c.code, cohort: undefined })} active={sp.country?.toUpperCase() === c.code} dark>
                <Flag code={c.code} emoji={c.flag} /> {c.name}
                <span className="opacity-60">{c.graduates.toLocaleString("en-GB")}</span>
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section id="results" className="scroll-mt-24 py-12 md:py-16">
        <div className="container-x">
          <div className="flex flex-col gap-5 border-b border-line pb-6">
            {countryCohorts.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-bold text-slate">Class</span>
                <FilterChip href={href({ cohort: undefined })} active={!sp.cohort}>
                  All
                </FilterChip>
                {countryCohorts
                  .filter((k) => k.graduates > 0)
                  .map((k) => (
                    <FilterChip key={k.slug} href={href({ cohort: k.slug })} active={sp.cohort === k.slug}>
                      {k.name} <span className="opacity-60">{k.graduates}</span>
                    </FilterChip>
                  ))}
              </div>
            )}
            {!sp.country && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-bold text-slate">Class</span>
                <FilterChip href={href({ cohort: undefined })} active={!sp.cohort}>
                  All
                </FilterChip>
                {activeCountries.flatMap((c) =>
                  c.cohorts
                    .filter((k) => k.graduates > 0)
                    .map((k) => (
                      <FilterChip key={k.slug} href={href({ cohort: k.slug })} active={sp.cohort === k.slug}>
                        <Flag code={c.code} emoji={c.flag} /> {k.name}
                      </FilterChip>
                    )),
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-bold text-slate">Public life</span>
              {OFFICE_FILTERS.map((o) => (
                <FilterChip key={o.v} href={href({ office: o.v || undefined })} active={(sp.office ?? "") === o.v}>
                  {o.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-slate" aria-live="polite">
              <span className="font-extrabold text-ink">{result.total.toLocaleString("en-GB")}</span> {result.total === 1 ? "graduate" : "graduates"}
              {sp.q && (
                <>
                  {" "}
                  matching <span className="font-extrabold text-ink">“{sp.q}”</span>
                </>
              )}
            </p>
            {filtered && (
              <Link href="/graduates#results" className="inline-flex items-center gap-1 text-sm font-bold text-slate hover:text-ink">
                <X className="size-4" /> Clear filters
              </Link>
            )}
          </div>

          {result.items.length ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((g) => (
                <li key={g.id}>
                  <GraduateCard g={g} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No graduate found"
                body="Check the spelling, or try fewer words. If you believe someone is an SPPG graduate but they aren't listed, contact the SPLN Secretariat."
              />
            </div>
          )}

          {result.pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <PageLink href={href({ page: String(result.page - 1) })} disabled={result.page <= 1} label="Previous page">
                <ChevronLeft className="size-4" />
              </PageLink>
              <span className="px-4 text-sm font-bold text-slate">
                Page {result.page} of {result.pages}
              </span>
              <PageLink href={href({ page: String(result.page + 1) })} disabled={result.page >= result.pages} label="Next page">
                <ChevronRight className="size-4" />
              </PageLink>
            </nav>
          )}

          <div className="mt-14 flex flex-col items-start gap-4 rounded-[16px] bg-green-tint p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex gap-4">
              <BadgeCheck className="mt-0.5 size-7 shrink-0 text-green-deep" />
              <div>
                <p className="text-lg font-extrabold">Are you an SPPG graduate?</p>
                <p className="text-slate">Find your name, then claim your profile with the email SPPG holds for you — add a photo, bio and social links.</p>
              </div>
            </div>
            <Link href="/claim" className="inline-flex h-11 shrink-0 items-center rounded-[4px] bg-green-deep px-5 font-bold text-white hover:bg-ink">
              Claim my profile
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterChip({ href, active, children, dark = false }: { href: string; active: boolean; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors",
        dark
          ? active
            ? "bg-white text-ink"
            : "border border-white/20 text-white/85 hover:bg-white/10"
          : active
            ? "bg-ink text-white"
            : "border border-line bg-white text-ink hover:border-ink/40",
      )}
    >
      {children}
    </Link>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled)
    return (
      <span className="grid size-10 place-items-center rounded-full border border-line text-slate/40" aria-hidden>
        {children}
      </span>
    );
  return (
    <Link href={href} aria-label={label} className="grid size-10 place-items-center rounded-full border border-line hover:border-ink">
      {children}
    </Link>
  );
}

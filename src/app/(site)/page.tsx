import Image from "next/image";
import Link from "next/link";
import { Search, ShieldCheck, Quote, PenLine, Sparkles } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { AfricaMap } from "@/components/site/africa-map";
import { GraduateCard, PostCard, SpotlightCard } from "@/components/site/cards";
import { ButtonLink, FrameBar, SectionHeading, TextLink, Badge } from "@/components/ui/primitives";
import { CountUp, Reveal } from "@/components/ui/motion";
import { HERO, NOT_ALUMNI, PATH, SITE, THREE_CS } from "@/content/site";
import { ACCENT_BG, ACCENT_TEXT, cn, countryAccent } from "@/lib/brand";
import { getFeaturedFaces, getNetworkTotals, getStatMap, listGallery, listPublishedPosts, listSpotlights } from "@/lib/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [totals, stat, spotlights, posts, faces, featuredPhotos, latestPhotos] = await Promise.all([
    getNetworkTotals(),
    getStatMap(),
    listSpotlights({ limit: 3 }),
    listPublishedPosts({ limit: 3 }),
    getFeaturedFaces(6),
    listGallery({ featuredOnly: true, limit: 8 }),
    listGallery({ limit: 8 }),
  ]);
  const photos = featuredPhotos.length >= 4 ? featuredPhotos : latestPhotos;
  const office = ["aspirants", "candidates", "appointed", "elected"].map((k) => stat[k]).filter(Boolean);
  const inOffice = (stat.appointed?.value ?? 0) + (stat.elected?.value ?? 0);

  return (
    <>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute inset-0">
          <Image src="/images/grad-stage.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top opacity-[0.16]" />
          <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/80 to-night" />
        </div>
        <div className="absolute -left-40 top-20 size-[36rem] rounded-full bg-green/25 blur-[120px]" aria-hidden />
        <div className="absolute -right-40 bottom-0 size-[30rem] rounded-full bg-blue/20 blur-[120px]" aria-hidden />

        <div className="container-x relative grid items-center gap-10 pb-10 pt-36 md:pt-44 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:pb-16">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur">
              <span className="tile-gradient rounded-full px-2.5 py-0.5 text-xs font-extrabold">SPLN</span>
              <span className="text-sm font-semibold text-white/80">{HERO.eyebrow}</span>
            </div>
            <h1 className="mt-7 text-[2.9rem] font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[5.2rem]">
              {HERO.headline[0]}
              <br />
              <span className="text-white/90">{HERO.headline[1]}</span>{" "}
              <span className="text-tile-gradient">{HERO.headline[2]}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">{HERO.sub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/join" size="lg" arrow>
                Apply to the next SPPG class
              </ButtonLink>
              <ButtonLink href="/graduates" size="lg" variant="ghost-light">
                Explore the network
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] text-white lg:max-w-none">
            <AfricaMap countries={totals.countries} className="h-auto w-full drop-shadow-[0_0_40px_rgba(5,175,75,0.15)]" />
          </div>
        </div>

        {/* Stat strip */}
        <div className="container-x relative pb-12 md:pb-16">
          <dl className="grid grid-cols-2 overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur md:grid-cols-5">
            {[
              { label: "SPPG graduates", value: totals.graduates, accent: "green" },
              { label: "Countries", value: totals.countries.length, accent: "blue", note: "growing to 20" },
              { label: "Graduating classes", value: totals.cohorts, accent: "red" },
              { label: "In public office", value: inOffice, accent: "amber", note: "appointed & elected" },
              { label: "Declared aspirants", value: stat.aspirants?.value ?? 0, accent: "green", note: "2023–2027" },
            ].map((s, i) => (
              <div key={s.label} className={cn("relative px-5 py-6 md:px-6", i > 0 && "border-white/10 md:border-l", i % 2 === 1 && "border-l", i >= 2 && "border-t md:border-t-0", i === 4 && "col-span-2 md:col-span-1")}>
                <span className={cn("absolute left-5 top-0 h-0.5 w-8 md:left-6", ACCENT_BG[s.accent as "green"])} />
                <dt className="text-sm font-semibold text-white/60">{s.label}</dt>
                <dd className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                  <CountUp value={s.value} />
                </dd>
                {s.note && <p className="mt-0.5 text-xs font-semibold text-white/45">{s.note}</p>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────────────────── NOT ALUMNI ───────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
              <Image src="/images/grad-audience.jpg" alt="SPPG graduates in green Class of 2024 stoles at their graduation ceremony" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            {/* Frame-corner motif */}
            <span className="absolute -left-3 -top-3 h-16 w-1.5 rounded-full bg-green" aria-hidden />
            <span className="absolute -left-3 -top-3 h-1.5 w-16 rounded-full bg-red" aria-hidden />
            <span className="absolute -bottom-3 -right-3 h-16 w-1.5 rounded-full bg-blue" aria-hidden />
            <span className="absolute -bottom-3 -right-3 h-1.5 w-16 rounded-full bg-amber" aria-hidden />
            <div className="absolute -bottom-8 left-6 right-16 rounded-[12px] bg-white p-5 shadow-[0_24px_60px_-28px_rgba(14,21,18,0.45)] md:left-10 md:right-auto md:max-w-sm">
              <Quote className="size-5 text-green" />
              <p className="mt-2 font-bold leading-snug">
                You are not joining an organisation that is waiting to be built. You are joining a community that is already moving.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="pt-8 lg:pt-0">
            <SectionHeading eyebrow="Why SPLN" title={NOT_ALUMNI.title} lead={NOT_ALUMNI.body} />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {THREE_CS.map((c) => (
                <div key={c.key} className="rounded-[12px] border border-line p-4">
                  <span className={cn("block h-1 w-8 rounded-full", ACCENT_BG[c.color])} />
                  <p className="mt-3 text-lg font-extrabold">{c.key}</p>
                  <p className="mt-1 text-sm leading-snug text-slate">{c.body}</p>
                </div>
              ))}
            </div>
            <TextLink href="/about" className="mt-8">
              Read our story
            </TextLink>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── PUBLIC OFFICE ───────────────────────── */}
      <section className="bg-sand py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Run to win. Govern good."
              title={<>The mandate doesn&apos;t end at graduation. <span className="text-green-deep">It begins there.</span></>}
              lead="SPPG graduates are declaring, contesting, winning and serving — across parties, across borders, at every level of government."
            />
            <TextLink href="/impact" className="shrink-0">
              See the full impact
            </TextLink>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {office.map((s, i) => {
              const accent = (["green", "blue", "red", "amber"] as const)[i % 4];
              return (
                <Reveal key={s.key} delay={i * 80}>
                  <div className="group relative h-full overflow-hidden rounded-[16px] border border-line bg-white p-7">
                    <span className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BG[accent])} />
                    <p className={cn("text-6xl font-black tracking-tight md:text-7xl", ACCENT_TEXT[accent])}>
                      <CountUp value={s.value} />
                    </p>
                    <p className="mt-3 text-lg font-extrabold">{s.label}</p>
                    {s.detail && <p className="mt-1 text-sm text-slate">{s.detail}</p>}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── THE PATH ───────────────────────── */}
      <section className="grain relative overflow-hidden bg-night py-20 text-white md:py-28">
        <div className="absolute right-0 top-0 size-[40rem] rounded-full bg-green/10 blur-[140px]" aria-hidden />
        <div className="container-x relative">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                dark
                eyebrow="The only way in"
                title={<>You can&apos;t buy a seat in this network. <span className="text-tile-gradient">You earn it.</span></>}
                lead="There is no membership fee, no application form, no shortcut. Every member of SPLN has been admitted to SPPG, completed ten demanding months, graduated, and been attested by SPPG's leadership on Character, Competence and Capacity."
              />
              <div className="mt-10 rounded-[16px] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-6 text-green" />
                  <p className="font-extrabold">The 3Cs Index</p>
                </div>
                <p className="mt-2 text-white/70">
                  Before induction, SPPG&apos;s Senior Leadership Team attests that each graduate&apos;s Character, Competence and Capacity score stands above the threshold. That attestation is what the green check on every directory profile means.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={SITE.applyUrl} size="lg" arrow>
                  Start with step one
                </ButtonLink>
                <ButtonLink href="/join" size="lg" variant="ghost-light">
                  The full journey
                </ButtonLink>
              </div>
            </div>

            <ol className="relative">
              <span className="absolute bottom-6 left-[1.4rem] top-6 w-px bg-gradient-to-b from-green via-blue to-amber md:left-[1.65rem]" aria-hidden />
              {PATH.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 60} className="relative flex gap-5 pb-10 last:pb-0 md:gap-7">
                  <span
                    className={cn(
                      "relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-sm font-black md:size-[3.3rem] md:text-base",
                      i === PATH.length - 1 ? "tile-gradient text-white" : "border border-white/20 bg-night text-white",
                    )}
                  >
                    {s.n}
                  </span>
                  <div className="pt-1.5 md:pt-2.5">
                    <h3 className="text-xl font-extrabold md:text-2xl">{s.title}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-white/70">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────────────────── SPOTLIGHT ───────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Spotlight"
              title="What our graduates are building."
              lead="Ventures launched, primaries won, appointments taken, reforms delivered. The network, in motion."
            />
            <TextLink href="/spotlight" className="shrink-0">
              All stories
            </TextLink>
          </div>
          {spotlights.length > 0 ? (
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {spotlights.map((s, i) => (
                <Reveal key={s.id} delay={i * 80} className={i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}>
                  <SpotlightCard s={s} large={i === 0} />
                </Reveal>
              ))}
              {spotlights.length < 3 && (
                <Reveal delay={160} className={spotlights.length === 1 ? "lg:row-span-2" : ""}>
                  <div className="flex h-full flex-col justify-between rounded-[16px] border border-line bg-sand p-7">
                    <div>
                      <Sparkles className="size-6 text-amber" />
                      <p className="mt-4 text-2xl font-extrabold leading-tight">Who should the network hear about next?</p>
                      <p className="mt-3 text-slate">
                        A venture launched, a primary won, an appointment taken, a reform delivered. Every Spotlight starts with a nomination — including your own.
                      </p>
                    </div>
                    <ButtonLink href="/spotlight#nominate" variant="secondary" arrow className="mt-8 self-start">
                      Nominate a graduate
                    </ButtonLink>
                  </div>
                </Reveal>
              )}
            </div>
          ) : (
            <div className="mt-12 grid overflow-hidden rounded-[16px] bg-night text-white md:grid-cols-2">
              <div className="relative min-h-64">
                <Image src="/images/ke-embrace.jpg" alt="Graduates of SPPG Kenya celebrating" fill sizes="50vw" className="object-cover" />
              </div>
              <div className="p-8 md:p-12">
                <Sparkles className="size-6 text-amber" />
                <p className="mt-4 text-2xl font-extrabold">The first stories are being written.</p>
                <p className="mt-3 text-white/70">
                  Know a graduate who just launched a venture, won a primary, took up an appointment or delivered a reform? Tell us — every Spotlight starts with a nomination.
                </p>
                <ButtonLink href="/spotlight#nominate" variant="light" arrow className="mt-6">
                  Nominate a graduate
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── VERIFY A GRADUATE ───────────────────────── */}
      <section className="bg-sand py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The Graduate Directory"
              title="Every graduate, publicly verifiable."
              lead={`Confirm that someone is a genuine SPPG graduate — by name, country or class. ${totals.graduates.toLocaleString("en-GB")} graduates, ${totals.cohorts} classes, ${totals.countriesWithGraduates} countries, one register.`}
            />
            <form action="/graduates" className="mt-8 flex max-w-xl items-center gap-2 rounded-[8px] border border-line bg-white p-2 shadow-[0_12px_30px_-20px_rgba(14,21,18,0.4)] focus-within:border-green">
              <Search className="ml-2 size-5 shrink-0 text-slate" />
              <label htmlFor="home-q" className="sr-only">
                Search graduates by name
              </label>
              <input id="home-q" name="q" placeholder="Search a graduate's name…" className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate/60" />
              <button className="h-11 rounded-[4px] bg-ink px-5 font-bold text-white hover:bg-green-deep">Verify</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {totals.countries
                .filter((c) => c.graduates > 0)
                .map((c) => (
                  <Link key={c.code} href={`/graduates?country=${c.code}`}>
                    <Badge accent={countryAccent(c.code)} className="px-3 py-1 text-sm hover:opacity-80">
                      <Flag code={c.code} emoji={c.flag} /> {c.name} · {c.graduates.toLocaleString("en-GB")}
                    </Badge>
                  </Link>
                ))}
            </div>
            <p className="mt-8 text-sm text-slate">
              Are you a graduate?{" "}
              <Link href="/claim" className="font-bold text-green-deep underline underline-offset-2">
                Claim your profile
              </Link>{" "}
              with the email SPPG holds for you, then add your photo, bio and links.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {faces.length >= 4
              ? faces.slice(0, 6).map((g) => <GraduateCard key={g.id} g={g} />)
              : totals.countries
                  .flatMap((c) => c.cohorts.filter((k) => k.graduates > 0).map((k) => ({ ...k, flag: c.flag, code: c.code, countryName: c.name })))
                  .reverse()
                  .slice(0, 8)
                  .map((k, i) => (
                    <Reveal key={k.id} delay={i * 50}>
                      <Link
                        href={`/graduates?cohort=${k.slug}`}
                        className="group flex items-center justify-between rounded-[12px] border border-line bg-white p-5 transition-colors hover:border-ink/30"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate">
                            <Flag code={k.code} emoji={k.flag} /> {k.countryName}
                          </p>
                          <p className="text-lg font-extrabold">{k.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-2xl font-black", ACCENT_TEXT[countryAccent(k.code)])}>{k.graduates}</p>
                          <p className="text-xs font-semibold text-slate">graduates</p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── INSIGHTS ───────────────────────── */}
      {posts.items.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Insights" title="Ideas from the network." lead="News, analysis and thought leadership from SPPG graduates — reviewed against SPPG's standard of evidence." />
              <div className="flex shrink-0 gap-6">
                <TextLink href="/write">Write for SPLN</TextLink>
                <TextLink href="/insights">All insights</TextLink>
              </div>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {posts.items.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <PostCard p={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────── COUNTRIES ───────────────────────── */}
      <section className={cn("pb-20 md:pb-28", posts.items.length === 0 && "pt-20 md:pt-28")}>
        <div className="container-x">
          <SectionHeading eyebrow="One school, many nations" title="Rooted in each country. Connected across all of them." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {totals.countries.map((c, i) => {
              const accent = countryAccent(c.code, i);
              return (
                <Reveal key={c.code} delay={i * 70}>
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[16px] border border-line p-6">
                    <span className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BG[accent])} />
                    <div className="flex items-center justify-between">
                      <Flag code={c.code} emoji={c.flag} className="text-4xl" />
                      {c.admissionsOpen && <Badge accent="green">Admissions open</Badge>}
                    </div>
                    <p className="mt-5 text-2xl font-extrabold">{c.name}</p>
                    <p className={cn("mt-1 font-bold", ACCENT_TEXT[accent])}>
                      {c.graduates > 0 ? `${c.graduates.toLocaleString("en-GB")} graduates · ${c.cohorts.filter((k) => k.graduates > 0).length} ${c.cohorts.filter((k) => k.graduates > 0).length === 1 ? "class" : "classes"}` : "Pioneer class in admissions"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate">{c.blurb}</p>
                    {c.partner && <p className="mt-3 text-xs font-semibold text-slate">In partnership with {c.partner}</p>}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── IN PICTURES ───────────────────────── */}
      {photos.length >= 4 && (
        <section className="pb-20 md:pb-28">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="In pictures" title="Moments from the movement." lead="Graduations and convenings across Nigeria, Senegal, Kenya and beyond." />
              <TextLink href="/gallery" className="shrink-0">
                Open the gallery
              </TextLink>
            </div>
            <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
              {photos.slice(0, 6).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/gallery?country=${p.countryCode}`}
                  className={cn("group relative overflow-hidden rounded-[12px] bg-sand", i === 0 && "col-span-2 row-span-2", i === 3 && "md:col-span-2")}
                >
                  <Image src={p.url} alt={p.caption ?? ""} fill sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-3 pt-10 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 md:text-sm">
                    {p.cohortName ?? p.occasion}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────── CLOSING CTA ───────────────────────── */}
      <section className="relative overflow-hidden bg-night text-white">
        <Image src="/images/ke-flags-crowd.jpg" alt="" fill sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/20" />
        <div className="container-x relative py-24 md:py-36">
          <FrameBar thick />
          <h2 className="mt-8 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
            Don&apos;t do politics alone. Don&apos;t govern alone.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/75 md:text-xl">
            The next class is forming in Nigeria, Kenya, Senegal and Ghana. Be counted among the leaders Africa is waiting for.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={SITE.applyUrl} size="lg" arrow>
              Apply to SPPG
            </ButtonLink>
            <ButtonLink href="/write" size="lg" variant="ghost-light">
              <PenLine className="size-4" /> Graduates: write for SPLN
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}


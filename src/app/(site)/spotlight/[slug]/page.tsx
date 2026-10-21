import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, ExternalLink, FileCheck2 } from "lucide-react";
import { SpotlightCard } from "@/components/site/cards";
import { Avatar, FrameBar, SampleBadge, buttonClass } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { Markdown } from "@/components/ui/markdown";
import { formatDate } from "@/lib/text";
import { getPublishedSpotlight, listSpotlights } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const s = await getPublishedSpotlight((await params).slug);
  if (!s) return { title: "Story not found" };
  const img = s.coverUrl ?? s.graduatePhoto;
  return { title: s.title, description: s.summary ?? undefined, openGraph: { type: "article", images: img ? [img] : undefined } };
}

export default async function SpotlightStoryPage({ params }: { params: Params }) {
  const s = await getPublishedSpotlight((await params).slug);
  if (!s) notFound();
  const more = (await listSpotlights({ limit: 4 })).filter((x) => x.id !== s.id).slice(0, 3);
  const cover = s.coverUrl ?? s.graduatePhoto;
  const gallery = s.gallery ?? [];
  const links = s.evidenceLinks ?? [];

  return (
    <article>
      <header className="relative overflow-hidden bg-night text-white">
        {cover && (
          <>
            <Image src={cover} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/75 to-night/30" />
          </>
        )}
        <div className="container-x relative pb-14 pt-36 md:pb-20 md:pt-48">
          <Link href="/spotlight" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Spotlight
          </Link>
          <p className="mt-8 flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink">{s.category}</span>
            {s.isSample && <SampleBadge />}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.03em] md:text-6xl">{s.title}</h1>
          {s.summary && <p className="mt-5 max-w-2xl text-lg text-white/80 md:text-xl">{s.summary}</p>}
          <div className="mt-8 flex items-center gap-4">
            <Avatar name={s.graduateName} src={s.graduatePhoto} countryCode={s.countryCode} size={52} />
            <div>
              <p className="flex items-center gap-1.5 font-extrabold">
                {s.graduateName} <BadgeCheck className="size-4 text-green" />
              </p>
              <p className="text-sm text-white/70">
                <Flag code={s.countryCode} emoji={s.countryFlag} /> {s.countryName} · {s.cohortName}
                {s.publishedAt && <> · {formatDate(s.publishedAt)}</>}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div className="max-w-3xl">
          <Markdown>{s.story}</Markdown>

          {gallery.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-extrabold">In pictures</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.map((g, i) => (
                  <figure key={g.url} className={i === 0 && gallery.length % 2 === 1 ? "sm:col-span-2" : ""}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-sand">
                      <Image src={g.url} alt={g.caption ?? ""} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                    {g.caption && <figcaption className="mt-2 text-sm text-slate">{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[16px] border border-line p-6">
            <p className="eyebrow text-slate">About the graduate</p>
            <FrameBar className="mt-3" />
            <div className="mt-5 flex items-center gap-3">
              <Avatar name={s.graduateName} src={s.graduatePhoto} countryCode={s.countryCode} size={48} />
              <div className="min-w-0">
                <p className="truncate font-extrabold">{s.graduateName}</p>
                {s.graduateHeadline && <p className="line-clamp-2 text-sm text-slate">{s.graduateHeadline}</p>}
              </div>
            </div>
            {!s.graduateHidden && (
              <Link href={`/graduates/${s.graduateSlug}`} className={buttonClass("secondary", "sm", "mt-5 w-full")}>
                View profile
              </Link>
            )}
          </div>
          {links.length > 0 && (
            <div className="rounded-[16px] bg-sand p-6">
              <p className="flex items-center gap-2 font-extrabold">
                <FileCheck2 className="size-5 text-green-deep" /> Sources &amp; evidence
              </p>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="flex items-start gap-2 text-sm font-semibold text-green-deep hover:underline">
                      <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                      <span className="break-all">{l.label ?? new URL(l.url).hostname.replace(/^www\./, "")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {more.length > 0 && (
        <section className="border-t border-line bg-sand py-14">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold">More from the network</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {more.map((m) => (
                <SpotlightCard key={m.id} s={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

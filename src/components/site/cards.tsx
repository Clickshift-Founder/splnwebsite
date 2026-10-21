import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Landmark } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { Avatar, Badge } from "@/components/ui/primitives";
import { OFFICE_LABEL, countryAccent } from "@/lib/brand";
import { formatDate, readingTime } from "@/lib/text";
import type { PublicGraduate, PostListItem, SpotlightItem } from "@/lib/queries";

/* ── Graduate ── */
export function GraduateCard({ g }: { g: Omit<PublicGraduate, "bio"> & { bio?: string | null } }) {
  return (
    <Link
      href={`/graduates/${g.slug}`}
      className="group relative flex h-full flex-col rounded-[16px] border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_18px_40px_-24px_rgba(14,21,18,0.35)]"
    >
      <div className="flex items-start gap-4">
        <Avatar name={g.fullName} src={g.photoUrl} countryCode={g.countryCode} size={60} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-extrabold leading-tight tracking-tight text-ink">
            <span className="truncate">{g.fullName}</span>
            <BadgeCheck className="size-4 shrink-0 text-green" aria-label="Verified SPPG graduate" />
          </p>
          {g.headline ? (
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate">{g.headline}</p>
          ) : (
            <p className="mt-1 text-sm text-slate/70">SPPG graduate</p>
          )}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <Badge accent={countryAccent(g.countryCode)}>
          <Flag code={g.countryCode} emoji={g.countryFlag} /> {g.cohortName}
        </Badge>
        {g.officeStatus !== "none" && (
          <Badge className="bg-ink text-white ring-0">
            <Landmark className="size-3" /> {OFFICE_LABEL[g.officeStatus]}
          </Badge>
        )}
      </div>
    </Link>
  );
}

/* ── Spotlight ── */
export function SpotlightCard({ s, large = false }: { s: SpotlightItem; large?: boolean }) {
  const img = s.coverUrl ?? s.graduatePhoto;
  return (
    <Link href={`/spotlight/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[16px] bg-night text-white">
      <div className={large ? "relative aspect-[16/10]" : "relative aspect-[4/3]"}>
        {img ? (
          <Image src={img} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="tile-gradient absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-ink">{s.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className={large ? "text-2xl font-extrabold leading-tight md:text-3xl" : "text-xl font-extrabold leading-snug"}>{s.title}</h3>
        {s.summary && <p className="mt-3 line-clamp-3 text-white/70">{s.summary}</p>}
        <div className="mt-auto flex items-center gap-3 pt-6">
          <Avatar name={s.graduateName} src={s.graduatePhoto} countryCode={s.countryCode} size={36} />
          <div className="min-w-0 text-sm">
            <p className="truncate font-bold">{s.graduateName}</p>
            <p className="truncate text-white/60">
              <Flag code={s.countryCode} emoji={s.countryFlag} /> {s.cohortName}
            </p>
          </div>
          <ArrowUpRight className="ml-auto size-5 shrink-0 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        </div>
      </div>
    </Link>
  );
}

/* ── Insight / post ── */
const TYPE_LABEL = { news: "News", article: "Article", thought_leadership: "Thought Leadership" } as const;

export function PostCard({ p, horizontal = false }: { p: PostListItem; horizontal?: boolean }) {
  const author = p.authorFullName && !p.authorHidden ? p.authorFullName : p.authorName ?? "SPLN";
  return (
    <Link
      href={`/insights/${p.slug}`}
      className={
        horizontal
          ? "group grid gap-5 border-b border-line py-6 sm:grid-cols-[200px_1fr]"
          : "group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-white transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(14,21,18,0.35)]"
      }
    >
      <div className={horizontal ? "relative aspect-[4/3] overflow-hidden rounded-[8px]" : "relative aspect-[16/9] overflow-hidden"}>
        {p.coverUrl ? (
          <Image src={p.coverUrl} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="absolute inset-0 grid place-items-end bg-night p-4">
            <div className="absolute inset-0 tile-gradient opacity-25" />
            <p className="relative line-clamp-3 text-lg font-extrabold leading-tight text-white/90">{p.title}</p>
          </div>
        )}
      </div>
      <div className={horizontal ? "" : "flex flex-1 flex-col p-6"}>
        <p className="eyebrow text-green-deep">
          {TYPE_LABEL[p.type]}
          {p.topic ? <span className="text-slate"> · {p.topic}</span> : null}
        </p>
        <h3 className="mt-2 text-xl font-extrabold leading-snug tracking-tight group-hover:text-green-deep">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-3 text-slate">{p.excerpt}</p>}
        <p className="mt-auto pt-4 text-sm font-semibold text-slate">
          {author} · {formatDate(p.publishedAt, { day: "numeric", month: "short", year: "numeric" })} · {readingTime(p.body)} min read
        </p>
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ p }: { p: PostListItem }) {
  const author = p.authorFullName && !p.authorHidden ? p.authorFullName : p.authorName ?? "SPLN";
  return (
    <Link href={`/insights/${p.slug}`} className="group grid overflow-hidden rounded-[16px] bg-night text-white md:grid-cols-[1.15fr_1fr]">
      <div className="relative min-h-64 overflow-hidden md:min-h-[24rem]">
        {p.coverUrl ? (
          <Image src={p.coverUrl} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <>
            <Image src="/images/grad-stage.jpg" alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="tile-gradient absolute inset-0 opacity-30 mix-blend-multiply" />
          </>
        )}
      </div>
      <div className="flex flex-col justify-center p-7 md:p-12">
        <p className="eyebrow text-green">Featured · {TYPE_LABEL[p.type]}</p>
        <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-4xl">{p.title}</h2>
        {p.excerpt && <p className="mt-4 line-clamp-4 text-white/70 md:text-lg">{p.excerpt}</p>}
        <p className="mt-6 text-sm font-semibold text-white/60">
          {author} · {formatDate(p.publishedAt, { day: "numeric", month: "short", year: "numeric" })} · {readingTime(p.body)} min read
        </p>
      </div>
    </Link>
  );
}

export { TYPE_LABEL };

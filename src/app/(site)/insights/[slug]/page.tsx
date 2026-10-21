import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpenCheck } from "lucide-react";
import { PostCard, TYPE_LABEL } from "@/components/site/cards";
import { Avatar, ButtonLink, FrameBar, SampleBadge } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import { formatDate, readingTime } from "@/lib/text";
import { getPublishedPost, listPublishedPosts } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getPublishedPost((await params).slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.title,
    description: p.excerpt ?? undefined,
    openGraph: { type: "article", images: p.coverUrl ? [p.coverUrl] : undefined, publishedTime: p.publishedAt?.toISOString() },
  };
}

export default async function InsightPage({ params }: { params: Params }) {
  const p = await getPublishedPost((await params).slug);
  if (!p) notFound();
  const more = (await listPublishedPosts({ limit: 4 })).items.filter((x) => x.id !== p.id).slice(0, 3);
  const byGraduate = p.authorFullName && !p.authorHidden;
  const sources = (p.sources ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <article>
      <header className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-blue/20 blur-3xl" aria-hidden />
        <div className="container-x relative max-w-4xl pb-12 pt-36 md:pb-16 md:pt-44">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Insights
          </Link>
          <p className="eyebrow mt-8 flex flex-wrap items-center gap-2 text-green">
            {p.isSample && <SampleBadge />}
            {TYPE_LABEL[p.type]}
            {p.topic && <span className="text-white/60"> · {p.topic}</span>}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.03em] md:text-[3.4rem]">{p.title}</h1>
          {p.excerpt && <p className="mt-5 text-lg text-white/75 md:text-xl">{p.excerpt}</p>}
          <div className="mt-8 flex items-center gap-4">
            {byGraduate ? (
              <Avatar name={p.authorFullName!} src={p.authorPhoto} size={48} />
            ) : (
              <Image src="/brand/spln-mark.png" alt="" width={48} height={36} className="h-9 w-auto" />
            )}
            <div className="text-sm">
              <p className="flex items-center gap-1.5 font-extrabold">
                {byGraduate ? (
                  <Link href={`/graduates/${p.authorSlug}`} className="hover:underline">
                    {p.authorFullName}
                  </Link>
                ) : (
                  p.authorName ?? "SPLN"
                )}
                {byGraduate && <BadgeCheck className="size-4 text-green" aria-label="Verified SPPG graduate" />}
              </p>
              <p className="text-white/60">
                {formatDate(p.publishedAt)} · {readingTime(p.body)} min read
              </p>
            </div>
          </div>
        </div>
      </header>

      {p.coverUrl && (
        <div className="container-x -mb-4 max-w-5xl pt-10">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[16px]">
            <Image src={p.coverUrl} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-x max-w-3xl py-14 md:py-20">
        <Markdown>{p.body}</Markdown>

        {sources.length > 0 && (
          <section className="mt-14 rounded-[16px] bg-sand p-6 md:p-8">
            <p className="flex items-center gap-2 font-extrabold">
              <BookOpenCheck className="size-5 text-green-deep" /> Sources &amp; references
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate">
              {sources.map((s, i) => {
                const url = s.match(/https?:\/\/\S+/)?.[0];
                return (
                  <li key={i} className="break-words">
                    {url ? (
                      <>
                        {s.replace(url, "").replace(/[—\-–\s]+$/, "")}{" "}
                        <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-green-deep underline underline-offset-2">
                          link
                        </a>
                      </>
                    ) : (
                      s
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {byGraduate && (
          <p className="mt-10 border-t border-line pt-6 text-sm text-slate">
            Views expressed are the author&apos;s own. Reviewed by the SPLN editorial team for evidence and non-partisanship.
          </p>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-[16px] bg-night p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <FrameBar />
            <p className="mt-4 text-xl font-extrabold">Are you an SPPG graduate with something to say?</p>
          </div>
          <ButtonLink href="/write" variant="light" arrow className="shrink-0">
            Write for SPLN
          </ButtonLink>
        </div>
      </div>

      {more.length > 0 && (
        <section className="border-t border-line bg-sand py-14">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold">Keep reading</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {more.map((m) => (
                <PostCard key={m.id} p={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

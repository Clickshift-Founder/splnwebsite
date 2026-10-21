import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { FeaturedPostCard, PostCard } from "@/components/site/cards";
import { ButtonLink, EmptyState, PageHero } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/brand";
import { listPublishedPosts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Insights",
  description: "News, analysis and thought leadership from SPPG graduates on politics, policy and governance in Africa.",
};
export const revalidate = 300;

const TABS = [
  { v: "", label: "Everything" },
  { v: "thought_leadership", label: "Thought Leadership" },
  { v: "article", label: "Articles" },
  { v: "news", label: "Network News" },
];

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const { type, page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const { items, pages } = await listPublishedPosts({ type, page: p, limit: 13 });
  const [lead, ...rest] = p === 1 ? items : [undefined, ...items];

  return (
    <>
      <PageHero
        eyebrow="SPLN Insights"
        title={
          <>
            Ideas that <span className="text-tile-gradient">move Africa forward.</span>
          </>
        }
        lead="Analysis, argument and news from the graduates of the School of Politics, Policy & Governance — every piece held to SPPG's standard of evidence."
      >
        <ButtonLink href="/write" variant="light" arrow>
          <PenLine className="size-4" /> Write for SPLN
        </ButtonLink>
      </PageHero>

      <section className="py-14 md:py-20">
        <div className="container-x">
          <nav className="mb-10 flex flex-wrap gap-2" aria-label="Filter insights">
            {TABS.map((t) => (
              <Link
                key={t.v}
                href={t.v ? `/insights?type=${t.v}` : "/insights"}
                className={cn("rounded-full px-4 py-2 text-sm font-bold", (type ?? "") === t.v ? "bg-ink text-white" : "border border-line hover:border-ink/40")}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          {items.length === 0 ? (
            <EmptyState title="Nothing here yet" body="Be the first graduate to publish in this section." action={<ButtonLink href="/write">Write for SPLN</ButtonLink>} />
          ) : (
            <>
              {lead && (
                <Reveal>
                  <div className="mb-10">
                    <FeaturedPostCard p={lead} />
                  </div>
                </Reveal>
              )}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.filter(Boolean).map((post, i) => (
                  <Reveal key={post!.id} delay={(i % 3) * 70}>
                    <PostCard p={post!} />
                  </Reveal>
                ))}
              </div>
            </>
          )}

          {pages > 1 && (
            <div className="mt-12 flex justify-center gap-3">
              {p > 1 && <ButtonLink href={`/insights?${new URLSearchParams({ ...(type ? { type } : {}), page: String(p - 1) })}`} variant="secondary">Newer</ButtonLink>}
              {p < pages && <ButtonLink href={`/insights?${new URLSearchParams({ ...(type ? { type } : {}), page: String(p + 1) })}`} variant="secondary">Older</ButtonLink>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

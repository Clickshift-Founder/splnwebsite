import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import { EmptyState, FrameBar, PageHero } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { ACCENT_BG, cn, countryAccent } from "@/lib/brand";
import { getCountries, listGallery, type GalleryItem } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Graduations, inductions and convenings of the SPPG Public Leaders Network — by country and class.",
};
export const revalidate = 300;

type Album = { key: string; title: string; subtitle: string; sort: number; photos: GalleryItem[] };

/** Group photos into albums: one per class, plus one per occasion for photos not tied to a class. */
function toAlbums(photos: GalleryItem[]): Album[] {
  const map = new Map<string, Album>();
  for (const p of photos) {
    const key = p.cohortId ? `c${p.cohortId}` : `o${p.occasion}`;
    if (!map.has(key))
      map.set(key, {
        key,
        title: p.cohortName ?? p.occasion,
        subtitle: p.cohortName ? p.occasion : p.occasion === "Graduation" ? "Across classes" : "Convenings & moments",
        sort: p.cohortId ? -(p.cohortYear ?? 0) * 100 - (p.cohortSort ?? 0) : 1,
        photos: [],
      });
    map.get(key)!.photos.push(p);
  }
  return [...map.values()].sort((a, b) => a.sort - b.sort);
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ country?: string }> }) {
  const { country } = await searchParams;
  const [countries, all] = await Promise.all([getCountries(), listGallery()]);
  const withPhotos = countries.filter((c) => all.some((p) => p.countryCode === c.code));
  const active = country?.toUpperCase();
  const shown = countries.filter((c) => (active ? c.code === active : true)).filter((c) => all.some((p) => p.countryCode === c.code));

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        image="/images/sn-class-wide.jpg"
        title={
          <>
            Every class. <span className="text-tile-gradient">Every country.</span> One movement.
          </>
        }
        lead="Graduations, inductions and convenings across the SPPG family — the moments our graduates walked the stage and joined the network."
      />

      <section className="py-12 md:py-16">
        <div className="container-x">
          <nav className="flex flex-wrap gap-2" aria-label="Filter by country">
            <Chip href="/gallery" active={!active}>
              All countries <span className="opacity-60">{all.length}</span>
            </Chip>
            {withPhotos.map((c) => (
              <Chip key={c.code} href={`/gallery?country=${c.code}`} active={active === c.code}>
                <Flag code={c.code} emoji={c.flag} /> {c.name} <span className="opacity-60">{all.filter((p) => p.countryCode === c.code).length}</span>
              </Chip>
            ))}
          </nav>

          {shown.length === 0 && (
            <div className="mt-10">
              <EmptyState title="No photos here yet" body="Photos from graduations and convenings will appear here as the Secretariat uploads them." />
            </div>
          )}

          {shown.map((c, ci) => {
            const albums = toAlbums(all.filter((p) => p.countryCode === c.code));
            return (
              <div key={c.code} className="mt-14 first-of-type:mt-10">
                <div className="flex items-center gap-4 border-b border-line pb-4">
                  <Flag code={c.code} emoji={c.flag} className="text-3xl" />
                  <h2 className="text-3xl font-black tracking-tight">{c.name}</h2>
                  <span className={cn("ml-auto h-1 w-16 rounded-full", ACCENT_BG[countryAccent(c.code, ci)])} />
                </div>

                {albums.map((a) => (
                  <section key={a.key} id={`${c.code}-${a.key}`} className="mt-10 scroll-mt-28">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="eyebrow text-slate">{a.subtitle}</p>
                        <h3 className="mt-1 text-2xl font-extrabold">{a.title}</h3>
                      </div>
                      <p className="inline-flex items-center gap-1.5 text-sm font-bold text-slate">
                        <Images className="size-4" /> {a.photos.length} photo{a.photos.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <GalleryGrid
                      photos={a.photos.map((p) => ({
                        id: p.id,
                        url: p.url,
                        width: p.width,
                        height: p.height,
                        caption: p.caption,
                        label: `${c.name} · ${a.title}`,
                        isSample: p.isSample,
                      }))}
                    />
                  </section>
                ))}
              </div>
            );
          })}

          <div className="mt-16 rounded-[16px] bg-sand p-6 text-center md:p-8">
            <FrameBar className="mx-auto" />
            <p className="mt-4 text-lg font-extrabold">Have photos from your class&apos;s graduation?</p>
            <p className="mt-1 text-slate">Send them to your Class Representatives or the SPLN Secretariat to be added to the gallery.</p>
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
      className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors", active ? "bg-ink text-white" : "border border-line hover:border-ink/40")}
    >
      {children}
    </Link>
  );
}

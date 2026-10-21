import Image from "next/image";
import { Star } from "lucide-react";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Flag } from "@/components/ui/flag";
import { requireAdmin } from "@/lib/auth";
import { getCohorts, getCountries, listGallery } from "@/lib/queries";
import { deleteGalleryPhoto, updateGalleryPhoto } from "../../actions";
import { GalleryUploader } from "./gallery-uploader";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const [countries, cohorts, photos] = await Promise.all([getCountries(), getCohorts(), listGallery({ limit: 2000 })]);

  const albums = new Map<string, { title: string; countryCode: string; photos: typeof photos }>();
  for (const p of photos) {
    const key = `${p.countryCode}|${p.cohortId ?? p.occasion}`;
    const c = countries.find((x) => x.code === p.countryCode);
    if (!albums.has(key)) albums.set(key, { title: `${c?.name ?? p.countryCode} — ${p.cohortName ?? p.occasion}`, countryCode: p.countryCode, photos: [] });
    albums.get(key)!.photos.push(p);
  }

  return (
    <>
      <AdminHeader
        title="Gallery"
        sub="Photos are grouped on the public Gallery by country, then by class (or occasion). Starred photos appear on the homepage."
        actions={<ButtonLink href="/gallery" size="sm" variant="secondary">View gallery ↗</ButtonLink>}
      />

      <Panel title="Upload photos">
        <GalleryUploader
          countries={countries.map((c) => ({ code: c.code, name: c.name }))}
          cohorts={cohorts.map((c) => ({ id: c.id, name: c.name, countryCode: c.countryCode }))}
        />
      </Panel>

      <div className="mt-8 space-y-8">
        {[...albums.entries()].map(([key, a]) => (
          <Panel
            key={key}
            title={a.title}
            actions={
              <span className="flex items-center gap-2 text-sm font-bold text-slate">
                <Flag code={a.countryCode} /> {a.photos.length} photos
              </span>
            }
          >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {a.photos.map((p) => (
                <li key={p.id} className="overflow-hidden rounded-[10px] border border-line">
                  <div className="relative aspect-[4/3] bg-sand">
                    <Image src={p.url} alt={p.caption ?? ""} fill sizes="300px" className="object-cover" />
                    <div className="absolute left-2 top-2 flex gap-1">
                      {p.featured && <Badge accent="amber">★ Homepage</Badge>}
                      {p.isSample && <Badge>Sample</Badge>}
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    <form action={updateGalleryPhoto} className="flex gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="intent" value="caption" />
                      <input
                        name="caption"
                        defaultValue={p.caption ?? ""}
                        placeholder="Add a caption"
                        aria-label="Caption"
                        className="min-w-0 flex-1 rounded-[6px] border border-line px-2 py-1.5 text-sm outline-none focus:border-green"
                      />
                      <button className="rounded-[6px] bg-ink px-2.5 text-xs font-bold text-white">Save</button>
                    </form>
                    <div className="flex items-center justify-between">
                      <form action={updateGalleryPhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="intent" value="feature" />
                        <input type="hidden" name="featured" value={p.featured ? "0" : "1"} />
                        <button className="inline-flex items-center gap-1 text-xs font-bold text-slate hover:text-ink">
                          <Star className={p.featured ? "size-3.5 fill-amber text-amber" : "size-3.5"} /> {p.featured ? "Unstar" : "Star for homepage"}
                        </button>
                      </form>
                      <form action={deleteGalleryPhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message="Delete this photo from the gallery?" className="text-xs font-bold text-red hover:underline">
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}

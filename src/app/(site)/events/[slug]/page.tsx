import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Mic2, Users } from "lucide-react";
import { Avatar, Badge, ButtonLink, FrameBar } from "@/components/ui/primitives";
import { EVENTS, eventHasDetail } from "@/content/site";
import { ACCENT_BG, cn } from "@/lib/brand";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return EVENTS.filter(eventHasDetail).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const e = EVENTS.find((x) => x.slug === slug);
  if (!e) return { title: "Event not found" };
  return { title: e.title, description: e.body, openGraph: e.image ? { images: [e.image] } : undefined };
}

const ACCENTS = ["green", "blue", "red", "amber"] as const;

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const e = EVENTS.find((x) => x.slug === slug);
  if (!e || !eventHasDetail(e)) notFound();
  const past = e.date < new Date().toISOString().slice(0, 10);

  return (
    <article>
      <header className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-blue/20 blur-3xl" aria-hidden />
        <div className="container-x relative grid gap-10 pb-14 pt-32 md:pt-40 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pb-20">
          <div>
            <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white">
              <ArrowLeft className="size-4" /> Events
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Badge accent={past ? undefined : "green"}>{past ? "Past event" : "Upcoming"}</Badge>
              {e.series && <span className="eyebrow text-white/60">{e.series}</span>}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.03em] md:text-6xl">{e.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/75">{e.body}</p>
            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-bold">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="size-5 text-green" /> {e.when}
              </div>
              {e.time && (
                <div className="inline-flex items-center gap-2">
                  <Clock className="size-5 text-green" /> {e.time}
                </div>
              )}
              <div className="inline-flex items-center gap-2">
                <MapPin className="size-5 text-green" /> {e.place}
              </div>
            </dl>
            {e.link && (
              <ButtonLink href={e.link} variant="light" arrow className="mt-8">
                {e.linkLabel ?? "Event link"}
              </ButtonLink>
            )}
          </div>
          {e.image && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] shadow-2xl ring-1 ring-white/10">
              <Image src={e.image} alt={`${e.title} — event flyer`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </header>

      {e.speakers && e.speakers.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container-x">
            <p className="eyebrow text-slate">Speakers</p>
            <FrameBar className="mt-3" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {e.speakers.map((s, i) => (
                <div key={s.name} className="relative overflow-hidden rounded-[16px] border border-line p-6">
                  <span className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BG[ACCENTS[i % 4]])} />
                  <Avatar name={s.name.replace(/^(Sen|Hon|Dr|Mr|Mrs|Prof)\.?\s+/i, "")} size={52} />
                  <p className="mt-4 text-lg font-extrabold leading-tight">{s.name}</p>
                  <p className="mt-1.5 text-sm leading-snug text-slate">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {e.agenda && e.agenda.length > 0 && (
        <section className="bg-sand py-14 md:py-20">
          <div className="container-x grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
            <div>
              <p className="eyebrow text-slate">Programme</p>
              <FrameBar className="mt-3" />
              <div className="mt-8 space-y-8">
                {e.agenda.map((seg, i) => (
                  <div key={seg.title} className="overflow-hidden rounded-[16px] bg-white">
                    <div className="flex items-center gap-3 border-b border-line px-6 py-4">
                      <span className={cn("size-2.5 rounded-full", ACCENT_BG[ACCENTS[i % 4]])} />
                      <h2 className="text-lg font-extrabold">{seg.title}</h2>
                    </div>
                    <ol className="divide-y divide-line">
                      {seg.items.map((it, j) => (
                        <li key={j} className="flex gap-4 px-6 py-3.5">
                          <span className="w-5 shrink-0 pt-0.5 text-xs font-black text-slate/60">{j + 1}</span>
                          <div>
                            <p className="font-bold leading-snug">{it.title}</p>
                            {it.who && <p className="mt-0.5 text-sm text-slate">{it.who}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              {e.moderators && (
                <div className="rounded-[16px] bg-white p-6">
                  <p className="flex items-center gap-2 font-extrabold">
                    <Mic2 className="size-5 text-green-deep" /> Moderators
                  </p>
                  <ul className="mt-3 space-y-1">
                    {e.moderators.map((m) => (
                      <li key={m} className="font-semibold">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {e.poweredBy && (
                <div className="rounded-[16px] bg-night p-6 text-white">
                  <p className="flex items-center gap-2 font-extrabold">
                    <Users className="size-5 text-green" /> Powered by
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {e.poweredBy.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <Link href="/network#committees" className="mt-4 inline-block text-sm font-bold text-green hover:underline">
                    Meet the committees →
                  </Link>
                </div>
              )}
              {e.agendaImage && (
                <a href={e.agendaImage} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[16px] ring-1 ring-line">
                  <Image src={e.agendaImage} alt={`${e.title} — printed agenda`} width={904} height={1280} sizes="(min-width: 1024px) 25vw, 100vw" className="h-auto w-full" />
                  <span className="block bg-white px-4 py-2.5 text-center text-sm font-bold text-green-deep">Open the printed agenda ↗</span>
                </a>
              )}
            </aside>
          </div>
        </section>
      )}
    </article>
  );
}

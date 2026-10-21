import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin, PlayCircle } from "lucide-react";
import { Badge, ButtonLink, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { EVENTS, SITE, eventHasDetail, type SplnEvent } from "@/content/site";
import { cn } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Events",
  description: "SPLN colloquia, convenings, workshops, inductions and general meetings across Africa.",
};

export default function EventsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = EVENTS.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = EVENTS.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHero
        eyebrow="Events"
        image="/images/afcon-group.jpg"
        title={
          <>
            Where the network <span className="text-tile-gradient">meets.</span>
          </>
        }
        lead="Colloquia, flagship convenings, leadership clinics, inductions and the bi-annual General Meeting — online and across the countries SPPG serves."
      >
        <ButtonLink href={SITE.launchVideo} variant="light">
          <PlayCircle className="size-4" /> Watch the Global SPLN Launch
        </ButtonLink>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="container-x">
          {upcoming.length > 0 && (
            <>
              <SectionHeading eyebrow="Upcoming" title="Coming up." />
              <div className="mb-20 mt-10 grid gap-5 md:grid-cols-2">
                {upcoming.map((e) => (
                  <EventCard key={e.slug} e={e} upcoming />
                ))}
              </div>
            </>
          )}
          <SectionHeading eyebrow="Past" title="Moments from the movement." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {past.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 2) * 70}>
                <EventCard e={e} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function EventCard({ e, upcoming = false }: { e: SplnEvent; upcoming?: boolean }) {
  const detail = eventHasDetail(e);
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[16px]", upcoming ? "bg-night text-white" : "border border-line bg-white")}>
      {e.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-sand">
          <Image src={e.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge accent={upcoming ? "green" : undefined}>{e.kind}</Badge>
          {e.series && <span className="text-xs font-bold text-slate">{e.series}</span>}
        </div>
        <h3 className="mt-4 text-2xl font-extrabold leading-tight">
          {detail ? (
            <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0 hover:text-green-deep">
              {e.title}
            </Link>
          ) : (
            e.title
          )}
        </h3>
        <p className={cn("mt-3 leading-relaxed", upcoming ? "text-white/70" : "text-slate")}>{e.body}</p>
        <div className={cn("mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6 text-sm font-bold", upcoming ? "text-white/80" : "text-ink")}>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {e.when}
          </span>
          {e.time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {e.time}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {e.place}
          </span>
          {e.link && (
            <a href={e.link} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1.5 text-green-deep hover:underline">
              <PlayCircle className="size-4" /> {e.linkLabel}
            </a>
          )}
          {detail && (
            <span className="ml-auto inline-flex items-center gap-1 text-green-deep">
              Programme <ArrowUpRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

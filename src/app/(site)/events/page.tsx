import type { Metadata } from "next";
import { CalendarDays, MapPin, PlayCircle } from "lucide-react";
import { Badge, ButtonLink, PageHero, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { EVENTS, SITE } from "@/content/site";
import { cn } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Events",
  description: "SPLN convenings, workshops, inductions and general meetings across Africa.",
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
        lead="Flagship convenings, leadership clinics, inductions and the bi-annual General Meeting — online and across the countries SPPG serves."
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
              <div className="mb-20 mt-10 grid gap-4 md:grid-cols-2">
                {upcoming.map((e) => (
                  <EventCard key={e.title} e={e} upcoming />
                ))}
              </div>
            </>
          )}
          <SectionHeading eyebrow="Past" title="Moments from the movement." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {past.map((e, i) => (
              <Reveal key={e.title} delay={(i % 2) * 70}>
                <EventCard e={e} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function EventCard({ e, upcoming = false }: { e: (typeof EVENTS)[number]; upcoming?: boolean }) {
  return (
    <article className={cn("flex h-full flex-col rounded-[16px] p-7", upcoming ? "bg-night text-white" : "border border-line")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge accent={upcoming ? "green" : undefined}>{e.kind}</Badge>
      </div>
      <h3 className="mt-4 text-2xl font-extrabold leading-tight">{e.title}</h3>
      <p className={cn("mt-3 leading-relaxed", upcoming ? "text-white/70" : "text-slate")}>{e.body}</p>
      <div className={cn("mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6 text-sm font-bold", upcoming ? "text-white/80" : "text-ink")}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" /> {e.when}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" /> {e.place}
        </span>
        {"link" in e && e.link && (
          <a href={e.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-green-deep hover:underline">
            <PlayCircle className="size-4" /> {e.linkLabel}
          </a>
        )}
      </div>
    </article>
  );
}

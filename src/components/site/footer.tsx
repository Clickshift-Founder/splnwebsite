import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/content/site";
import { FrameEdge, ButtonLink } from "@/components/ui/primitives";
import { XIcon, LinkedInIcon, FacebookIcon } from "@/components/ui/social-icons";
import { Flag } from "@/components/ui/flag";
import type { Country } from "@/db/schema";

const COLUMNS = [
  {
    title: "The Network",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/network", label: "How SPLN works" },
      { href: "/network#committees", label: "Committees" },
      { href: "/network#peerbridge", label: "PeerBridge mentorship" },
      { href: "/about#pledge", label: "Graduation pledge" },
    ],
  },
  {
    title: "Graduates",
    links: [
      { href: "/graduates", label: "Graduate directory" },
      { href: "/spotlight", label: "Spotlight" },
      { href: "/impact", label: "Impact & public office" },
      { href: "/claim", label: "Claim your profile" },
    ],
  },
  {
    title: "Ideas & Events",
    links: [
      { href: "/insights", label: "Insights" },
      { href: "/write", label: "Write for SPLN" },
      { href: "/events", label: "Events" },
      { href: "/join", label: "How to join" },
    ],
  },
];

export function SiteFooter({ countries }: { countries: Country[] }) {
  return (
    <footer className="bg-night text-white">
      <FrameEdge />
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Image src="/brand/spln-logo-light.png" alt="SPPG Public Leaders Network" width={300} height={37} className="h-auto w-[260px]" />
          <p className="mt-6 max-w-sm leading-relaxed text-white/65">
            The lifelong community of graduates of the School of Politics, Policy &amp; Governance. {SITE.tagline}
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { href: SITE.socials.linkedin, Icon: LinkedInIcon, label: "LinkedIn" },
              { href: SITE.socials.x, Icon: XIcon, label: "X" },
              { href: SITE.socials.facebook, Icon: FacebookIcon, label: "Facebook" },
            ]
              .filter((s) => s.href)
              .map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`SPPG on ${label}`}
                className="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-5">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow text-white/45">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[0.95rem] text-white/80 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-white/45">Admissions</p>
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            {countries.map((c) => (
              <li key={c.code} className="flex items-start gap-2 text-white/80">
                <Flag code={c.code} emoji={c.flag} className="mt-1" />
                {c.admissionsEmail ? (
                  <a href={`mailto:${c.admissionsEmail}`} className="break-all hover:text-white">
                    {c.admissionsEmail}
                  </a>
                ) : (
                  <span>
                    {c.name} — <Link href={SITE.applyUrl} target="_blank" className="underline underline-offset-2 hover:text-white">apply online</Link>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8 text-white/45">The Secretariat</p>
          <a href={`mailto:${SITE.contactEmail}`} className="mt-3 block text-white/80 hover:text-white">
            {SITE.contactEmail}
          </a>
          <ButtonLink href={SITE.applyUrl} variant="primary" size="sm" arrow className="mt-6">
            Apply to SPPG
          </ButtonLink>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} SPPG Public Leaders Network · A community of the{" "}
            <a href={SITE.parentUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
              School of Politics, Policy &amp; Governance
            </a>
          </p>
          <p className="eyebrow text-white/40">Character · Competence · Capacity</p>
        </div>
      </div>
    </footer>
  );
}

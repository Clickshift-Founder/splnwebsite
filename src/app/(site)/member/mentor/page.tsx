import type { Metadata } from "next";
import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";
import { MemberShell } from "@/components/site/member-shell";
import { ButtonLink } from "@/components/ui/primitives";
import { PEERBRIDGE, SITE } from "@/content/site";
import { requireMember } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const metadata: Metadata = { title: "Become a PeerBridge mentor", robots: { index: false } };

/**
 * Graduates-only gate for the PeerBridge mentor form. Middleware sends signed-out visitors to /claim
 * first, so the Airtable link is only ever shown to verified SPPG graduates.
 */
export default async function MentorPage() {
  const me = await requireMember(SITE.mentorPath);
  await audit(`graduate:${me.id}`, "mentor.form_opened");

  return (
    <MemberShell title="Become a PeerBridge mentor" eyebrow="PeerBridge Mentorship" active="/member">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div>
          <p className="text-lg leading-relaxed text-slate">
            Thank you, {me.fullName.split(" ")[0]}. You&apos;re verified as an SPPG graduate, so you can register to mentor a new student through the demanding first months of the programme.
          </p>
          <h2 className="mt-10 text-2xl font-extrabold">Before you register</h2>
          <ul className="mt-5 space-y-3">
            {[
              "You have 5+ years of leadership experience — in public service, civic leadership, policy or reform.",
              "You can commit to a structured 6-month cycle.",
              "A virtual orientation, monthly one-on-one check-ins, and at least one peer learning circle.",
              "Short reflections at the midpoint and at the end of the cycle.",
            ].map((r) => (
              <li key={r} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-green text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {r}
              </li>
            ))}
          </ul>
          <ButtonLink href={SITE.mentorApplyUrl} size="lg" className="mt-10">
            Open the mentor registration form <ExternalLink className="size-4" />
          </ButtonLink>
          <p className="mt-3 text-sm text-slate">The form opens in a new tab. Matching happens during Orientation Week.</p>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[16px] ring-1 ring-line">
          <Image src={PEERBRIDGE.mentorImage} alt="SPPG PeerBridge Mentorship Programme" fill sizes="380px" className="object-cover" />
        </div>
      </div>
    </MemberShell>
  );
}

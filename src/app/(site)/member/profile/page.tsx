import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates } from "@/db/schema";
import { MemberShell } from "@/components/site/member-shell";
import { requireMember } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Edit my profile", robots: { index: false } };

export default async function MemberProfilePage() {
  const me = await requireMember("/member/profile");
  const [g] = await db
    .select({
      headline: graduates.headline,
      location: graduates.location,
      bio: graduates.bio,
      photoUrl: graduates.photoUrl,
      linkedinUrl: graduates.linkedinUrl,
      xUrl: graduates.xUrl,
      facebookUrl: graduates.facebookUrl,
    })
    .from(graduates)
    .where(eq(graduates.id, me.id));

  return (
    <MemberShell title="Your public profile" active="/member/profile">
      <ProfileForm g={g} />
    </MemberShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Landmark, MapPin, PencilLine, ShieldCheck, ArrowLeft } from "lucide-react";
import { GraduateCard, PostCard, SpotlightCard } from "@/components/site/cards";
import { Avatar, Badge, FrameBar, buttonClass } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { SocialLinks } from "@/components/ui/social-icons";
import { OFFICE_LABEL, countryAccent } from "@/lib/brand";
import { getMember } from "@/lib/auth";
import { getClassmates, getGraduateBySlug, getPostsByGraduate, listSpotlights } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const g = await getGraduateBySlug((await params).slug);
  if (!g) return { title: "Graduate not found" };
  return {
    title: g.fullName,
    description: `${g.fullName} is a verified graduate of the School of Politics, Policy & Governance — ${g.countryName}, ${g.cohortName}.${g.headline ? ` ${g.headline}.` : ""}`,
    openGraph: g.photoUrl ? { images: [g.photoUrl] } : undefined,
  };
}

export default async function GraduateProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const g = await getGraduateBySlug(slug);
  if (!g) notFound();

  const [member, spotlights, posts, classmates] = await Promise.all([
    getMember(),
    listSpotlights({ graduateId: g.id, limit: 6 }),
    getPostsByGraduate(g.id),
    getClassmates(g.cohortId, g.id, 6),
  ]);
  const isOwner = member?.id === g.id;

  return (
    <>
      <section className="grain relative overflow-hidden bg-night text-white">
        <div className="absolute -left-32 top-0 size-[28rem] rounded-full bg-green/20 blur-3xl" aria-hidden />
        <div className="container-x relative pb-12 pt-32 md:pb-16 md:pt-40">
          <Link href="/graduates" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Graduate Directory
          </Link>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end">
            <div className="relative w-fit">
              <Avatar name={g.fullName} src={g.photoUrl} countryCode={g.countryCode} size={168} rounded="lg" className="ring-4 ring-white/10" />
              <span className="absolute -bottom-3 -right-3 grid size-11 place-items-center rounded-full bg-green ring-4 ring-night">
                <BadgeCheck className="size-6 text-white" aria-label="Verified SPPG graduate" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge accent={countryAccent(g.countryCode)}>
                  <Flag code={g.countryCode} emoji={g.countryFlag} /> {g.countryName} · {g.cohortName}
                </Badge>
                {g.officeStatus !== "none" && (
                  <Badge className="bg-white text-ink ring-0">
                    <Landmark className="size-3" /> {OFFICE_LABEL[g.officeStatus]}
                    {g.officeTitle ? ` · ${g.officeTitle}` : ""}
                  </Badge>
                )}
              </div>
              <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.03em] md:text-6xl">{g.fullName}</h1>
              {g.headline && <p className="mt-3 text-lg text-white/80 md:text-xl">{g.headline}</p>}
              {g.location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60">
                  <MapPin className="size-4" /> {g.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div>
            <p className="eyebrow text-slate">About</p>
            <FrameBar className="mt-3" />
            {g.bio ? (
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink">
                {g.bio.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-lg text-slate">
                {g.fullName.split(" ")[0]} hasn&apos;t added a bio yet.
                {!isOwner && " If this is you, claim your profile to tell the network what you're working on."}
              </p>
            )}

            {spotlights.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-extrabold">In the Spotlight</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {spotlights.map((s) => (
                    <SpotlightCard key={s.id} s={s} />
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-extrabold">Writing</h2>
                <div className="mt-2">
                  {posts.map((p) => (
                    <PostCard key={p.id} p={p} horizontal />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[16px] border border-line p-6">
              <div className="flex items-center gap-2 text-green-deep">
                <ShieldCheck className="size-5" />
                <p className="font-extrabold">Verified SPPG graduate</p>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Programme</dt>
                  <dd className="text-right font-bold">Certificate in Public Leadership &amp; Policy</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Country</dt>
                  <dd className="font-bold">{g.countryName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Class</dt>
                  <dd className="font-bold">{g.cohortName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Network</dt>
                  <dd className="font-bold">SPLN member</dd>
                </div>
              </dl>
              <SocialLinks x={g.xUrl} linkedin={g.linkedinUrl} facebook={g.facebookUrl} className="mt-5 flex gap-2 border-t border-line pt-5" />
            </div>

            <div className="rounded-[16px] bg-sand p-6">
              {isOwner ? (
                <>
                  <p className="font-extrabold">This is your profile</p>
                  <p className="mt-1 text-sm text-slate">Keep it current — your photo, role, bio and links are what the public sees.</p>
                  <Link href="/member/profile" className={buttonClass("primary", "md", "mt-4 w-full")}>
                    <PencilLine className="size-4" /> Edit my profile
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-extrabold">Is this you?</p>
                  <p className="mt-1 text-sm text-slate">
                    Verify with the email address SPPG holds on record for you, and you can edit this profile.
                  </p>
                  <Link href={`/claim?profile=${g.slug}`} className={buttonClass("secondary", "md", "mt-4 w-full")}>
                    <PencilLine className="size-4" /> Edit this profile
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {classmates.length > 0 && (
        <section className="border-t border-line bg-sand py-14">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold">
                More from the {g.countryName} {g.cohortName}
              </h2>
              <Link href={`/graduates?cohort=${g.cohortSlug}`} className="shrink-0 text-sm font-bold text-green-deep hover:underline">
                See the class
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classmates.map((c) => (
                <GraduateCard key={c.id} g={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, graduates, spotlights } from "@/db/schema";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { deleteSpotlight } from "../../../actions";
import { SpotlightForm } from "../spotlight-form";

export default async function AdminSpotlightPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [s] = isNew ? [undefined] : await db.select().from(spotlights).where(eq(spotlights.id, Number(id)));
  if (!isNew && !s) notFound();
  const [graduate] = s
    ? await db
        .select({ id: graduates.id, fullName: graduates.fullName, photoUrl: graduates.photoUrl, cohortName: cohorts.name, countryCode: cohorts.countryCode })
        .from(graduates)
        .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
        .where(eq(graduates.id, s.graduateId))
    : [null];

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/spotlights", label: "Spotlight" }}
        title={s?.title ?? "New Spotlight story"}
        actions={
          s && (
            <>
              {s.isPublished && (
                <ButtonLink href={`/spotlight/${s.slug}`} size="sm" variant="secondary">
                  View live ↗
                </ButtonLink>
              )}
              <form action={deleteSpotlight}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton message="Delete this Spotlight story permanently?" className="h-9 rounded-[4px] px-3 text-sm font-bold text-red hover:bg-red-tint">
                  Delete
                </ConfirmButton>
              </form>
            </>
          )
        }
      />
      {created && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Story created.</p>}
      <SpotlightForm s={s ?? {}} graduate={graduate} />
    </>
  );
}

import { notFound } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates, posts, spotlights } from "@/db/schema";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { getCohorts, getCountries } from "@/lib/queries";
import { deleteGraduate } from "../../../actions";
import { GraduateForm } from "../graduate-form";

export default async function AdminGraduatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const admin = await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [g] = isNew ? [undefined] : await db.select().from(graduates).where(eq(graduates.id, Number(id)));
  if (!isNew && !g) notFound();
  const [cohorts, countries] = await Promise.all([getCohorts(), getCountries()]);
  let deleteWarning = "";
  if (g && admin.role === "super_admin") {
    const [[s], [p]] = await Promise.all([
      db.select({ n: count() }).from(spotlights).where(eq(spotlights.graduateId, g.id)),
      db.select({ n: count() }).from(posts).where(eq(posts.authorGraduateId, g.id)),
    ]);
    const extras = [s.n && `${s.n} Spotlight stor${s.n === 1 ? "y" : "ies"}`, p.n && `${p.n} article${p.n === 1 ? "" : "s"}`].filter(Boolean);
    deleteWarning = `Permanently delete ${g.fullName} from the register${extras.length ? `, along with ${extras.join(" and ")}` : ""}? This cannot be undone. To remove someone from public view only, hide them instead.`;
  }
  const options = cohorts.map((c) => ({ id: c.id, label: `${countries.find((x) => x.code === c.countryCode)?.name ?? c.countryCode} — ${c.name}` }));

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/graduates", label: "Graduates" }}
        title={g?.fullName ?? "Add a graduate"}
        sub={g ? (g.profileClaimedAt ? `Profile claimed ${formatDate(g.profileClaimedAt)}` : "Profile not yet claimed by the graduate") : "Add someone missing from the register."}
        actions={
          g && (
            <>
              {!g.isHidden && (
                <ButtonLink href={`/graduates/${g.slug}`} size="sm" variant="secondary">
                  View public profile ↗
                </ButtonLink>
              )}
              {deleteWarning && (
                <form action={deleteGraduate}>
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton message={deleteWarning} className="h-9 rounded-[4px] px-3 text-sm font-bold text-red hover:bg-red-tint">
                    Delete
                  </ConfirmButton>
                </form>
              )}
            </>
          )
        }
      />
      {created && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Graduate added.</p>}
      <GraduateForm g={g ?? {}} cohorts={options} />
    </>
  );
}

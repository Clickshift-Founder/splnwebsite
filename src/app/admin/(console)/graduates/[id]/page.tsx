import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { graduates } from "@/db/schema";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { getCohorts, getCountries } from "@/lib/queries";
import { GraduateForm } from "../graduate-form";

export default async function AdminGraduatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [g] = isNew ? [undefined] : await db.select().from(graduates).where(eq(graduates.id, Number(id)));
  if (!isNew && !g) notFound();
  const [cohorts, countries] = await Promise.all([getCohorts(), getCountries()]);
  const options = cohorts.map((c) => ({ id: c.id, label: `${countries.find((x) => x.code === c.countryCode)?.name ?? c.countryCode} — ${c.name}` }));

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/graduates", label: "Graduates" }}
        title={g?.fullName ?? "Add a graduate"}
        sub={g ? (g.profileClaimedAt ? `Profile claimed ${formatDate(g.profileClaimedAt)}` : "Profile not yet claimed by the graduate") : "Add someone missing from the register."}
        actions={g && !g.isHidden ? <ButtonLink href={`/graduates/${g.slug}`} size="sm" variant="secondary">View public profile ↗</ButtonLink> : undefined}
      />
      {created && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Graduate added.</p>}
      <GraduateForm g={g ?? {}} cohorts={options} />
    </>
  );
}

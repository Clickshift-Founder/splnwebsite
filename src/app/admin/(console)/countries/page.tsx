import { AdminHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { requireAdmin } from "@/lib/auth";
import { getNetworkTotals } from "@/lib/queries";
import { CohortForm, CountryForm } from "./forms";

export default async function CountriesPage() {
  await requireAdmin("super_admin");
  const totals = await getNetworkTotals();

  return (
    <>
      <AdminHeader
        title="Countries & classes"
        sub="Expanding to a new country or graduating a new class? Add it here — the map, directory filters, admissions bar and impact pages update automatically."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {totals.countries.map((c) => (
          <Panel
            key={c.code}
            title={`${c.name} (${c.code})`}
            actions={
              <span className="flex items-center gap-2">
                <Flag code={c.code} emoji={c.flag} />
                <Badge accent={c.status === "active" ? "green" : c.status === "launching" ? "amber" : undefined}>{c.status}</Badge>
              </span>
            }
          >
            <CountryForm c={c} />
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 text-sm font-extrabold">Classes</p>
              <div className="space-y-3">
                {c.cohorts.map((k) => (
                  <CohortForm key={k.id} k={{ ...k, countryCode: c.code }} graduates={k.graduates} />
                ))}
                <CohortForm k={{ countryCode: c.code }} />
              </div>
            </div>
          </Panel>
        ))}
        <Panel title="Add a country">
          <CountryForm />
        </Panel>
      </div>
    </>
  );
}

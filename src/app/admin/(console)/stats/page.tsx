import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { Flag } from "@/components/ui/flag";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { getNetworkTotals, getStats } from "@/lib/queries";
import { deleteStat } from "../../actions";
import { AddStatForm, StatsForm } from "./stats-form";

export default async function AdminStatsPage() {
  const admin = await requireAdmin();
  const [rows, totals] = await Promise.all([getStats(), getNetworkTotals()]);

  return (
    <>
      <AdminHeader title="Numbers" sub="Public-office figures are edited here and update everywhere on the site within minutes. Graduate counts are calculated automatically from the register." />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Editable figures">
          <StatsForm
            rows={rows.map((r) => ({ key: r.key, label: r.label, value: r.value, detail: r.detail, group: r.group, updated: formatDate(r.updatedAt, { day: "numeric", month: "short", year: "numeric" }) }))}
          />
          {admin.role === "super_admin" && rows.length > 0 && (
            <details className="mt-6 text-sm">
              <summary className="cursor-pointer font-bold text-slate">Remove a figure</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {rows.map((r) => (
                  <form key={r.key} action={deleteStat}>
                    <input type="hidden" name="key" value={r.key} />
                    <ConfirmButton message={`Remove "${r.label}" from the site?`} className="rounded-full border border-line px-3 py-1 font-bold hover:border-red hover:text-red">
                      ✕ {r.label}
                    </ConfirmButton>
                  </form>
                ))}
              </div>
            </details>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Graduates (automatic)">
            <p className="text-4xl font-black">{totals.graduates.toLocaleString("en-GB")}</p>
            <p className="text-sm text-slate">
              across {totals.cohorts} classes in {totals.countriesWithGraduates} countries
            </p>
            <ul className="mt-4 divide-y divide-line text-sm">
              {totals.countries.map((c) => (
                <li key={c.code} className="flex justify-between py-2">
                  <span className="font-bold">
                    <Flag code={c.code} emoji={c.flag} /> {c.name}
                  </span>
                  <span className="tabular-nums">{c.graduates.toLocaleString("en-GB")}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate">To change these, add, import or edit graduates. Hidden graduates still count.</p>
          </Panel>
          <Panel title="Add a figure">
            <AddStatForm />
          </Panel>
        </div>
      </div>
    </>
  );
}

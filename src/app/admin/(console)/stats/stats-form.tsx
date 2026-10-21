"use client";

import { FormMessage, Input, Select, SubmitButton, useFormAction, type ActionResult } from "@/components/ui/form";
import { addStat, saveStats } from "../../actions";

type Row = { key: string; label: string; value: number; detail: string | null; group: string; updated: string };

const GROUP_LABEL: Record<string, string> = { public_office: "Graduates in public office", network: "Network" };

export function StatsForm({ rows }: { rows: Row[] }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveStats, null);
  const groups = [...new Set(rows.map((r) => r.group))];
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {groups.map((g) => (
        <div key={g}>
          <p className="eyebrow mb-3 text-slate">{GROUP_LABEL[g] ?? g}</p>
          <div className="space-y-3">
            {rows
              .filter((r) => r.group === g)
              .map((r) => (
                <div key={r.key} className="grid gap-3 rounded-[8px] bg-sand p-3 sm:grid-cols-[120px_1fr_1fr]">
                  <div>
                    <label htmlFor={`value_${r.key}`} className="mb-1 block text-xs font-bold text-slate">
                      Value
                    </label>
                    <Input name={`value_${r.key}`} type="number" min={0} defaultValue={r.value} className="text-xl font-black" />
                  </div>
                  <div>
                    <label htmlFor={`label_${r.key}`} className="mb-1 block text-xs font-bold text-slate">
                      Label
                    </label>
                    <Input name={`label_${r.key}`} defaultValue={r.label} />
                  </div>
                  <div>
                    <label htmlFor={`detail_${r.key}`} className="mb-1 block text-xs font-bold text-slate">
                      Detail (optional) · updated {r.updated}
                    </label>
                    <Input name={`detail_${r.key}`} defaultValue={r.detail ?? ""} placeholder="e.g. Nigeria 30 · Senegal 3" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Save numbers</SubmitButton>
    </form>
  );
}

export function AddStatForm() {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(addStat, null);
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input name="label" placeholder="Label, e.g. Won party primaries" required />
      <div className="grid grid-cols-2 gap-3">
        <Input name="value" type="number" min={0} placeholder="Value" />
        <Select name="group" defaultValue="public_office">
          <option value="public_office">Public office</option>
          <option value="network">Network</option>
        </Select>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} variant="secondary">
        Add figure
      </SubmitButton>
    </form>
  );
}

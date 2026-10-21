"use client";

import { Field, FormMessage, Input, Select, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { saveCohort, saveCountry } from "../../actions";

type C = Partial<{
  code: string;
  name: string;
  flag: string;
  status: string;
  admissionsOpen: boolean;
  admissionsEmail: string | null;
  applyUrl: string | null;
  partner: string | null;
  blurb: string | null;
  sortOrder: number;
}>;

export function CountryForm({ c = {} }: { c?: C }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveCountry, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {c.code ? <input type="hidden" name="code" value={c.code} /> : null}
      {!c.code && (
        <Field label="ISO code" name="code" error={fe.code} hint="2 letters, e.g. GH, ZA, RW">
          <Input name="code" maxLength={2} required />
        </Field>
      )}
      <Field label="Name" name="name" error={fe.name}>
        <Input name="name" defaultValue={c.name} required />
      </Field>
      <Field label="Flag emoji" name="flag" hint="Fallback where no SVG flag exists">
        <Input name="flag" defaultValue={c.flag ?? ""} required />
      </Field>
      <Field label="Status" name="status">
        <Select name="status" defaultValue={c.status ?? "planned"}>
          <option value="active">Active — has graduates</option>
          <option value="launching">Launching — first class in progress</option>
          <option value="planned">Planned</option>
        </Select>
      </Field>
      <Field label="Admissions email" name="admissionsEmail">
        <Input name="admissionsEmail" defaultValue={c.admissionsEmail ?? ""} />
      </Field>
      <Field label="Apply URL" name="applyUrl">
        <Input name="applyUrl" defaultValue={c.applyUrl ?? ""} placeholder="https://thesppg.org/admissions" />
      </Field>
      <Field label="Partner institution" name="partner">
        <Input name="partner" defaultValue={c.partner ?? ""} />
      </Field>
      <Field label="Sort order" name="sortOrder">
        <Input name="sortOrder" type="number" defaultValue={c.sortOrder ?? 10} />
      </Field>
      <Field label="Short description" name="blurb" className="sm:col-span-2">
        <Textarea name="blurb" rows={2} defaultValue={c.blurb ?? ""} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
        <input type="checkbox" name="admissionsOpen" defaultChecked={c.admissionsOpen} className="size-4 accent-[#05af4b]" /> Admissions open (shows in the site-wide admissions bar)
      </label>
      <div className="sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton pending={pending} variant="secondary" className="mt-2">
          {c.code ? "Save country" : "Add country"}
        </SubmitButton>
      </div>
    </form>
  );
}

type K = Partial<{ id: number; name: string; year: number; sourceLabel: string | null; countryCode: string }>;

export function CohortForm({ k, graduates }: { k: K; graduates?: number }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveCohort, null);
  return (
    <form onSubmit={onSubmit} className="rounded-[8px] bg-sand p-3">
      {k.id && <input type="hidden" name="id" value={k.id} />}
      <input type="hidden" name="countryCode" value={k.countryCode} />
      <div className="grid gap-2 sm:grid-cols-[1fr_90px_1fr_auto] sm:items-center">
        <Input name="name" defaultValue={k.name} placeholder="New class, e.g. Class of 2027" required aria-label="Class name" />
        <Input name="year" type="number" defaultValue={k.year ?? new Date().getFullYear() + 1} required aria-label="Graduation year" />
        <Input name="sourceLabel" defaultValue={k.sourceLabel ?? ""} placeholder="CSV 'Class' label" aria-label="CSV import label" />
        <SubmitButton pending={pending} variant={k.id ? "ghost" : "secondary"} className="h-11">
          {k.id ? "Save" : "Add"}
        </SubmitButton>
      </div>
      {graduates !== undefined && <p className="mt-1.5 text-xs font-bold text-slate">{graduates} graduates</p>}
      {state && <div className="mt-2"><FormMessage state={state} /></div>}
    </form>
  );
}

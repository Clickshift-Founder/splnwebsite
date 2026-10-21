"use client";

import { FormMessage, SubmitButton, useFormAction, type ActionResult } from "@/components/ui/form";
import { importGraduates } from "../../actions";

export function ImportForm() {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(importGraduates, null);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-slate">
        Columns: <code className="rounded bg-sand px-1">Name, Email, Matric Number, Phone Number, State of Residence, Class</code>. &ldquo;Class&rdquo; must match a class
        name or import label set under Countries &amp; classes (e.g. <em>Class of 2026</em>, <em>Senegal</em>, <em>Kenya Pioneer Class</em>). Graduates are matched by
        email, so re-importing updates people instead of duplicating them, and never overwrites what graduates wrote on their profiles.
      </p>
      <input name="file" type="file" accept=".csv,text/csv" required className="block text-sm file:mr-3 file:rounded-[6px] file:border-0 file:bg-ink file:px-4 file:py-2 file:font-bold file:text-white" />
      <FormMessage state={state} />
      <SubmitButton pending={pending} variant="secondary">
        Import CSV
      </SubmitButton>
    </form>
  );
}

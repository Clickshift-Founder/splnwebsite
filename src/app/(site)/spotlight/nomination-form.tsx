"use client";

import { Field, FormMessage, Input, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { submitNomination } from "./actions";

export function NominationForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(submitNomination, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  if (state?.ok) return <FormMessage state={state} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="hidden" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field label="Graduate you're nominating" name="nomineeName" required error={fe.nomineeName}>
        <Input name="nomineeName" placeholder="Full name (it can be you!)" />
      </Field>
      <Field label="What happened?" name="reason" required error={fe.reason} hint="The venture, win, appointment, reform or recognition — with dates and specifics.">
        <Textarea name="reason" rows={5} />
      </Field>
      <Field label="Evidence link" name="evidenceUrl" error={fe.evidenceUrl} hint="A news report, official announcement, website or post.">
        <Input name="evidenceUrl" placeholder="https://" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="nominatorName" required error={fe.nominatorName}>
          <Input name="nominatorName" defaultValue={defaultName} />
        </Field>
        <Field label="Your email" name="nominatorEmail" required error={fe.nominatorEmail}>
          <Input name="nominatorEmail" type="email" defaultValue={defaultEmail} />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-full sm:w-auto">
        Send nomination
      </SubmitButton>
    </form>
  );
}

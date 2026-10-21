"use client";

import { Field, FormMessage, Input, SubmitButton, useFormAction, type ActionResult } from "@/components/ui/form";
import { adminLogin } from "../actions";

export function LoginForm() {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(adminLogin, null);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Email" name="email">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" name="password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}

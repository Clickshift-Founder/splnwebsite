"use client";

import { Field, FormMessage, Input, Select, SubmitButton, useFormAction, type ActionResult } from "@/components/ui/form";
import { changeOwnPassword, saveAdminUser } from "../../actions";

export function AdminUserForm() {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveAdminUser, null);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" name="name">
        <Input name="name" required />
      </Field>
      <Field label="Email" name="email">
        <Input name="email" type="email" required />
      </Field>
      <Field label="Temporary password" name="password" hint="At least 10 characters. Share it securely; they can change it here.">
        <Input name="password" type="text" minLength={10} required autoComplete="new-password" />
      </Field>
      <Field label="Role" name="role">
        <Select name="role" defaultValue="editor">
          <option value="editor">Editor</option>
          <option value="super_admin">Super admin</option>
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton pending={pending} className="mt-2">
          Save admin
        </SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(changeOwnPassword, null);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Current password" name="current">
        <Input name="current" type="password" required autoComplete="current-password" />
      </Field>
      <Field label="New password" name="next" hint="At least 10 characters.">
        <Input name="next" type="password" minLength={10} required autoComplete="new-password" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} variant="secondary">
        Change password
      </SubmitButton>
    </form>
  );
}

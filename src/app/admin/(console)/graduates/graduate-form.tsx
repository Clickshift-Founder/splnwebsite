"use client";

import { Field, FormMessage, Input, Select, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { saveGraduate } from "../../actions";

type G = Partial<{
  id: number;
  fullName: string;
  cohortId: number;
  email: string | null;
  altEmails: string | null;
  phone: string | null;
  matricNumber: string | null;
  stateOfResidence: string | null;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  location: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  facebookUrl: string | null;
  officeStatus: string;
  officeTitle: string | null;
  isHidden: boolean;
}>;

export function GraduateForm({ g = {}, cohorts }: { g?: G; cohorts: { id: number; label: string }[] }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveGraduate, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {g.id && <input type="hidden" name="id" value={g.id} />}

      <section className="rounded-[12px] border border-line bg-white p-5">
        <h2 className="font-extrabold">Register (private except name &amp; class)</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Full name" name="fullName" required error={fe.fullName}>
            <Input name="fullName" defaultValue={g.fullName} required />
          </Field>
          <Field label="Class" name="cohortId" required error={fe.cohortId}>
            <Select name="cohortId" defaultValue={g.cohortId ?? ""} required>
              <option value="">Choose…</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Email on file" name="email" error={fe.email} hint="Used for profile verification. Never shown publicly.">
            <Input name="email" type="email" defaultValue={g.email ?? ""} />
          </Field>
          <Field label="Other emails" name="altEmails" error={fe.altEmails} hint="Comma-separated. Also accepted for verification.">
            <Input name="altEmails" defaultValue={g.altEmails ?? ""} />
          </Field>
          <Field label="Phone" name="phone">
            <Input name="phone" defaultValue={g.phone ?? ""} />
          </Field>
          <Field label="Matric number" name="matricNumber">
            <Input name="matricNumber" defaultValue={g.matricNumber ?? ""} />
          </Field>
          <Field label="State of residence (private)" name="stateOfResidence">
            <Input name="stateOfResidence" defaultValue={g.stateOfResidence ?? ""} />
          </Field>
          <label className="flex items-center gap-3 self-end rounded-[8px] bg-sand p-3 text-sm font-bold">
            <input type="checkbox" name="isHidden" defaultChecked={g.isHidden} className="size-4 accent-[#1a1a1a]" />
            Hide from the public directory
          </label>
        </div>
      </section>

      <section className="rounded-[12px] border border-line bg-white p-5">
        <h2 className="font-extrabold">Public life</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Status" name="officeStatus">
            <Select name="officeStatus" defaultValue={g.officeStatus ?? "none"}>
              <option value="none">—</option>
              <option value="aspirant">Aspirant</option>
              <option value="candidate">Candidate</option>
              <option value="appointed">Appointed</option>
              <option value="elected">Elected</option>
            </Select>
          </Field>
          <Field label="Office / race" name="officeTitle" hint='e.g. "Commissioner for Education, Ogun State"'>
            <Input name="officeTitle" defaultValue={g.officeTitle ?? ""} />
          </Field>
        </div>
      </section>

      <section className="rounded-[12px] border border-line bg-white p-5">
        <h2 className="font-extrabold">Public profile</h2>
        <p className="text-sm text-slate">Graduates normally manage these themselves after claiming their profile.</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[200px_1fr]">
          <ImageUpload name="photoUrl" folder="profiles" shape="square" max={900} defaultValue={g.photoUrl} label="Photo" />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Headline" name="headline" error={fe.headline}>
              <Input name="headline" defaultValue={g.headline ?? ""} />
            </Field>
            <Field label="Location" name="location" error={fe.location}>
              <Input name="location" defaultValue={g.location ?? ""} />
            </Field>
            <Field label="Bio" name="bio" error={fe.bio} className="md:col-span-2">
              <Textarea name="bio" rows={4} defaultValue={g.bio ?? ""} />
            </Field>
            <Field label="LinkedIn" name="linkedinUrl" error={fe.linkedinUrl}>
              <Input name="linkedinUrl" defaultValue={g.linkedinUrl ?? ""} />
            </Field>
            <Field label="X" name="xUrl" error={fe.xUrl}>
              <Input name="xUrl" defaultValue={g.xUrl ?? ""} />
            </Field>
            <Field label="Facebook" name="facebookUrl" error={fe.facebookUrl}>
              <Input name="facebookUrl" defaultValue={g.facebookUrl ?? ""} />
            </Field>
          </div>
        </div>
      </section>

      <FormMessage state={state} />
      <SubmitButton pending={pending}>{g.id ? "Save graduate" : "Add graduate"}</SubmitButton>
    </form>
  );
}

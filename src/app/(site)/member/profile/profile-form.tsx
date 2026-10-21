"use client";

import { Field, FormMessage, Input, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { updateProfile } from "../actions";

type Profile = {
  headline: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  facebookUrl: string | null;
};

export function ProfileForm({ g }: { g: Profile }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(updateProfile, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <ImageUpload name="photoUrl" folder="profiles" shape="square" max={900} defaultValue={g.photoUrl} label="Profile photo" hint="A clear, recent headshot. Square works best." />

      <div className="space-y-6">
        <Field label="Current role / headline" name="headline" error={fe.headline} hint='e.g. "Special Adviser on Education, Ogun State" or "Founder, CivicTech Lab"'>
          <Input name="headline" defaultValue={g.headline ?? ""} maxLength={120} />
        </Field>
        <Field label="Location" name="location" error={fe.location} hint="City and country — shown publicly.">
          <Input name="location" defaultValue={g.location ?? ""} maxLength={80} placeholder="Abuja, Nigeria" />
        </Field>
        <Field label="Short bio" name="bio" error={fe.bio} hint="Up to 1,500 characters. What you work on, what you care about, what you've done since SPPG.">
          <Textarea name="bio" defaultValue={g.bio ?? ""} rows={7} maxLength={1500} />
        </Field>
        <div className="grid gap-6 md:grid-cols-3">
          <Field label="LinkedIn" name="linkedinUrl" error={fe.linkedinUrl}>
            <Input name="linkedinUrl" defaultValue={g.linkedinUrl ?? ""} placeholder="linkedin.com/in/you" />
          </Field>
          <Field label="X (Twitter)" name="xUrl" error={fe.xUrl}>
            <Input name="xUrl" defaultValue={g.xUrl ?? ""} placeholder="@handle" />
          </Field>
          <Field label="Facebook" name="facebookUrl" error={fe.facebookUrl}>
            <Input name="facebookUrl" defaultValue={g.facebookUrl ?? ""} placeholder="facebook.com/you" />
          </Field>
        </div>
        <FormMessage state={state} />
        <div className="flex items-center gap-4 border-t border-line pt-6">
          <SubmitButton pending={pending}>Save profile</SubmitButton>
          <p className="text-sm text-slate">Your name and class come from SPPG&apos;s register. To correct them, contact the Secretariat.</p>
        </div>
      </div>
    </form>
  );
}

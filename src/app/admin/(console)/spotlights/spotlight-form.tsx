"use client";

import { useState } from "react";
import { Field, FormMessage, Input, Select, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { GalleryUpload, ImageUpload } from "@/components/ui/image-upload";
import { MarkdownEditor } from "@/components/site/post-editor";
import { GraduatePicker } from "@/components/admin/graduate-picker";
import { SPOTLIGHT_CATEGORIES } from "@/content/site";
import { saveSpotlight } from "../../actions";

type S = Partial<{
  id: number;
  category: string;
  title: string;
  summary: string | null;
  story: string;
  coverUrl: string | null;
  gallery: { url: string; caption?: string }[] | null;
  evidenceLinks: { url: string; label?: string }[] | null;
  isPublished: boolean;
  featured: boolean;
}>;
type Grad = { id: number; fullName: string; photoUrl: string | null; cohortName: string; countryCode: string } | null;

const STORY_TEMPLATE = `**[Name]**, a graduate of SPPG's [Country] [Class], has [what happened — launched / won / was appointed / delivered].

## What happened

Describe the achievement with specifics: dates, places, scale, numbers.

## Why it matters

What problem does it address? Who benefits?

## The SPPG connection

Which of the 3Cs — Character, Competence, Capacity — shows up here? What did they carry from the programme?

> "A short quote from the graduate (with their consent)."`;

export function SpotlightForm({ s = {}, graduate }: { s?: S; graduate?: Grad }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveSpotlight, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const [grad, setGrad] = useState<Grad>(graduate ?? null);

  return (
    <form onSubmit={onSubmit} className="grid gap-8 xl:grid-cols-[1fr_340px]">
      {s.id && <input type="hidden" name="id" value={s.id} />}
      <div className="space-y-6">
        <section className="rounded-[12px] border border-line bg-white p-5">
          <Field label="Graduate" name="graduateId" required>
            <GraduatePicker name="graduateId" defaultValue={graduate} error={fe.graduateId} onChange={setGrad} />
          </Field>
          {grad && (
            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-[180px_1fr] sm:items-end">
              <ImageUpload name="profilePhotoUrl" folder="profiles" shape="square" max={900} defaultValue={grad.photoUrl} label="Graduate's photo" />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="setProfilePhoto" className="mt-0.5 size-4 accent-[#05af4b]" />
                Also use this as {grad.fullName.split(" ")[0]}&apos;s directory profile photo
              </label>
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-[12px] border border-line bg-white p-5">
          <div className="grid gap-5 md:grid-cols-[1fr_240px]">
            <Field label="Headline" name="title" required error={fe.title}>
              <Input name="title" defaultValue={s.title} placeholder="e.g. Class of 2022 graduate secures APC primary ticket for Ikeja Federal Constituency" />
            </Field>
            <Field label="Category" name="category" required>
              <Select name="category" defaultValue={s.category ?? SPOTLIGHT_CATEGORIES[0]}>
                {SPOTLIGHT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Summary" name="summary" error={fe.summary} hint="1–2 sentences for cards and social previews.">
            <Textarea name="summary" rows={2} defaultValue={s.summary ?? ""} maxLength={320} />
          </Field>
          <Field label="The story" name="story" required error={fe.story}>
            <MarkdownEditor name="story" defaultValue={s.story ?? ""} placeholder={STORY_TEMPLATE} rows={18} />
          </Field>
        </section>

        <section className="space-y-5 rounded-[12px] border border-line bg-white p-5">
          <ImageUpload name="coverUrl" folder="spotlights" defaultValue={s.coverUrl} label="Cover image" hint="Landscape. If empty, the graduate's photo is used." />
          <div>
            <p className="mb-2 text-sm font-bold">Evidence gallery</p>
            <GalleryUpload name="gallery" defaultValue={s.gallery ?? []} />
          </div>
          <Field
            label="Evidence links"
            name="evidenceLinks"
            error={fe.evidenceLinks}
            hint="One per line: https://link | Label (e.g. https://inecnigeria.org/… | INEC candidate list)"
          >
            <Textarea name="evidenceLinks" rows={4} defaultValue={(s.evidenceLinks ?? []).map((l) => (l.label ? `${l.url} | ${l.label}` : l.url)).join("\n")} />
          </Field>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-[12px] border border-line bg-white p-5">
          <p className="font-extrabold">Publishing</p>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={s.isPublished} className="mt-0.5 size-4 accent-[#05af4b]" />
            <span>
              <strong>Published</strong> — visible on the public Spotlight page
            </span>
          </label>
          <label className="mt-3 flex items-start gap-3 text-sm">
            <input type="checkbox" name="featured" defaultChecked={s.featured} className="mt-0.5 size-4 accent-[#05af4b]" />
            <span>
              <strong>Featured</strong> — pinned first on the homepage and Spotlight
            </span>
          </label>
          <FormMessage state={state} />
          <SubmitButton pending={pending} className="mt-5 w-full">
            Save story
          </SubmitButton>
        </div>
        <div className="rounded-[12px] bg-amber-tint p-5 text-sm text-[#6b4500]">
          <p className="font-extrabold">Before publishing</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>The graduate has approved the story.</li>
            <li>Facts are backed by the evidence links or photos.</li>
            <li>No campaign messaging, party logos or endorsements.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}

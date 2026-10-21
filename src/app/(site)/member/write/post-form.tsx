"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Field, FormMessage, Input, Select, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { MarkdownEditor } from "@/components/site/post-editor";
import { DECLARATIONS, WRITING_STANDARDS } from "@/content/site";
import { savePost } from "../actions";

type Draft = {
  id?: number;
  title?: string;
  type?: string;
  topic?: string | null;
  excerpt?: string | null;
  body?: string;
  coverUrl?: string | null;
  sources?: string | null;
  declarations?: string[] | null;
};

const BODY_PLACEHOLDER = `## The problem

Open with the governance problem, in plain language. Why does it matter now?

## The evidence

Back every claim with data — and say where it comes from, e.g. "According to the National Bureau of Statistics (2024)…" Link to sources inline.

## What could work

Propose practical, evidence-based options. What have other countries or states done?

## The takeaway

One clear message for public leaders.`;

export function PostForm({ draft = {} }: { draft?: Draft }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(savePost, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_340px]">
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      <div className="space-y-6">
        <Field label="Title" name="title" required error={fe.title}>
          <Input name="title" defaultValue={draft.title} maxLength={160} className="h-13 text-xl font-extrabold" placeholder="A clear, specific headline" />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Format" name="type" required>
            <Select name="type" defaultValue={draft.type ?? "article"}>
              <option value="article">Article — analysis, explainer, case study</option>
              <option value="thought_leadership">Thought leadership — argued perspective</option>
            </Select>
          </Field>
          <Field label="Topic" name="topic" error={fe.topic} hint="e.g. Electoral reform, Public finance, Health policy">
            <Input name="topic" defaultValue={draft.topic ?? ""} maxLength={60} />
          </Field>
        </div>
        <Field label="Summary" name="excerpt" required error={fe.excerpt} hint="One or two sentences that appear on cards and in search results.">
          <Textarea name="excerpt" defaultValue={draft.excerpt ?? ""} rows={2} maxLength={320} />
        </Field>
        <Field label="Your piece" name="body" required error={fe.body}>
          <MarkdownEditor name="body" defaultValue={draft.body ?? ""} placeholder={BODY_PLACEHOLDER} />
        </Field>
        <Field
          label="Sources & references"
          name="sources"
          required
          error={fe.sources}
          hint="One per line: Title — Publisher — Date — Link. Every statistic and factual claim in your piece must trace to a source here."
        >
          <Textarea
            name="sources"
            defaultValue={draft.sources ?? ""}
            rows={5}
            placeholder={"Nigeria Labour Force Survey Q2 2024 — National Bureau of Statistics — 2024 — https://nigerianstat.gov.ng/…"}
          />
        </Field>
        <ImageUpload name="coverUrl" folder="posts" defaultValue={draft.coverUrl} label="Cover image (optional)" hint="Use a photo you own or have permission to use. Landscape works best." />

        <fieldset className="rounded-[12px] border border-line bg-sand p-5">
          <legend className="px-2 text-sm font-extrabold">Editorial declarations</legend>
          <div className="space-y-3">
            {DECLARATIONS.map((d, i) => (
              <label key={i} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                <input type="checkbox" name={`decl_${i}`} defaultChecked={draft.declarations?.includes(d)} className="mt-0.5 size-4 shrink-0 accent-[#05af4b]" />
                {d}
              </label>
            ))}
          </div>
          {fe.declarations && <p className="mt-3 text-sm font-semibold text-red">{fe.declarations}</p>}
        </fieldset>

        <FormMessage state={state} />
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <SubmitButton name="intent" value="submit" pending={pending}>
            Submit for review
          </SubmitButton>
          <SubmitButton name="intent" value="draft" variant="secondary" pending={pending}>
            Save draft
          </SubmitButton>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[16px] bg-night p-6 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-green" />
            <p className="font-extrabold">The SPPG standard</p>
          </div>
          <ol className="mt-4 space-y-4">
            {WRITING_STANDARDS.map((s, i) => (
              <li key={s.title} className="text-sm">
                <p className="font-bold">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-0.5 leading-relaxed text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/write" target="_blank" className="mt-5 inline-block text-sm font-bold text-green hover:underline">
            Full submission guide →
          </Link>
        </div>
      </aside>
    </form>
  );
}

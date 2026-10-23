"use client";

import { Field, FormMessage, Input, Select, SubmitButton, Textarea, useFormAction, type ActionResult } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { MarkdownEditor } from "@/components/site/post-editor";
import { reviewPost, saveAdminPost, unpublishPost } from "../../actions";

type P = Partial<{
  id: number;
  title: string;
  type: string;
  topic: string | null;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  sources: string | null;
  authorName: string | null;
  featured: boolean;
  status: string;
  authorGraduateId: number | null;
}>;

export function AdminPostForm({ p = {} }: { p?: P }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(saveAdminPost, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const staff = !p.authorGraduateId;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <Field label="Title" name="title" required error={fe.title}>
        <Input name="title" defaultValue={p.title} className="text-lg font-extrabold" />
      </Field>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Format" name="type">
          <Select name="type" defaultValue={p.type ?? "news"}>
            <option value="news">Network news</option>
            <option value="article">Article</option>
            <option value="thought_leadership">Thought leadership</option>
          </Select>
        </Field>
        <Field label="Topic" name="topic" error={fe.topic}>
          <Input name="topic" defaultValue={p.topic ?? ""} />
        </Field>
        {staff && (
          <Field label="Byline" name="authorName" hint="Defaults to SPLN Secretariat">
            <Input name="authorName" defaultValue={p.authorName ?? ""} placeholder="SPLN Secretariat" />
          </Field>
        )}
      </div>
      <Field label="Summary" name="excerpt" error={fe.excerpt}>
        <Textarea name="excerpt" rows={2} defaultValue={p.excerpt ?? ""} maxLength={320} />
      </Field>
      <Field label="Body" name="body" required error={fe.body}>
        <MarkdownEditor name="body" defaultValue={p.body ?? ""} />
      </Field>
      <Field label="Sources" name="sources" hint="One per line.">
        <Textarea name="sources" rows={3} defaultValue={p.sources ?? ""} />
      </Field>
      <ImageUpload name="coverUrl" folder="posts" defaultValue={p.coverUrl} label="Cover image" />
      <label className="flex items-center gap-3 text-sm font-bold">
        <input type="checkbox" name="featured" defaultChecked={p.featured} className="size-4 accent-[#05af4b]" /> Feature on Insights
      </label>
      <FormMessage state={state} />
      <div className="flex flex-wrap gap-3 border-t border-line pt-5">
        {p.status !== "published" && (
          <SubmitButton name="intent" value="publish" pending={pending}>
            Save &amp; publish
          </SubmitButton>
        )}
        <SubmitButton name="intent" value="save" variant={p.status === "published" ? "primary" : "secondary"} pending={pending}>
          {p.status === "published" ? "Save changes" : "Save draft"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function ReviewForm({ id, note }: { id: number; note?: string | null }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(reviewPost, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Note to the author" name="reviewNote" error={fe.reviewNote} hint="Required when requesting changes or declining. Be specific: which claim needs a source, which section is partisan… The author is emailed your decision and this note, and can revise and resubmit.">
        <Textarea name="reviewNote" rows={4} defaultValue={note ?? ""} />
      </Field>
      <FormMessage state={state} />
      <div className="grid gap-2">
        <SubmitButton name="decision" value="published" pending={pending} className="w-full">
          Approve &amp; publish
        </SubmitButton>
        <SubmitButton name="decision" value="changes_requested" variant="secondary" pending={pending} className="w-full">
          Request changes
        </SubmitButton>
        <SubmitButton name="decision" value="rejected" variant="ghost" pending={pending} className="w-full text-red">
          Decline
        </SubmitButton>
      </div>
    </form>
  );
}

/** Unpublish control. For a graduate's piece the editor must say why; the author is emailed the reason. */
export function UnpublishForm({ id, needsReason }: { id: number; needsReason: boolean }) {
  const { state, onSubmit, pending } = useFormAction<ActionResult>(unpublishPost, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <details className="relative">
      <summary className="flex h-9 cursor-pointer list-none items-center rounded-[4px] border border-line bg-white px-3 text-sm font-bold hover:border-ink">
        Unpublish
      </summary>
      <form onSubmit={onSubmit} className="absolute right-0 z-20 mt-2 w-[min(22rem,85vw)] space-y-3 rounded-[12px] border border-line bg-white p-4 shadow-lg">
        <input type="hidden" name="id" value={id} />
        {needsReason ? (
          <Field label="Why is it being unpublished?" name="reason" required error={fe.reason} hint="The author sees this on their dashboard and by email, and can revise and resubmit.">
            <Textarea name="reason" rows={4} required minLength={10} maxLength={3000} />
          </Field>
        ) : (
          <p className="text-sm text-slate">Take this post off the site? It goes back to draft.</p>
        )}
        <FormMessage state={state} />
        <SubmitButton pending={pending} className="w-full">
          Unpublish
        </SubmitButton>
      </form>
    </details>
  );
}

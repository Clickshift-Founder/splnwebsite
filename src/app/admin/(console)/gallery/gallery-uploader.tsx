"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, AlertCircle, X } from "lucide-react";
import { Field, FormMessage, Input, Select, SubmitButton, useFormAction, type ActionResult } from "@/components/ui/form";
import { uploadImage } from "@/components/ui/image-upload";
import { addGalleryPhotos } from "../../actions";

type Country = { code: string; name: string };
type Cohort = { id: number; name: string; countryCode: string };
type Item = {
  key: string;
  name: string;
  preview: string;
  originalBytes: number;
  status: "queued" | "working" | "done" | "error";
  error?: string;
  url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  caption: string;
};

const OCCASIONS = ["Graduation", "Induction", "Convening", "Workshop", "Leadership Clinic", "General Meeting", "Africa Conference"];
const mb = (n: number) => (n / 1024 / 1024).toFixed(n > 10 * 1024 * 1024 ? 0 : 1) + " MB";

export function GalleryUploader({ countries, cohorts }: { countries: Country[]; cohorts: Cohort[] }) {
  const [country, setCountry] = useState(countries[0]?.code ?? "");
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { state, onSubmit, pending } = useFormAction<ActionResult>(async (prev, fd) => {
    const res = await addGalleryPhotos(prev, fd);
    if (res?.ok) setItems([]);
    return res;
  }, null);

  const classOptions = useMemo(() => cohorts.filter((c) => c.countryCode === country), [cohorts, country]);
  const busy = items.some((i) => i.status === "queued" || i.status === "working");
  const done = items.filter((i) => i.status === "done");

  const patch = (key: string, p: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)));

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 100);
    const fresh: Item[] = list.map((f) => ({
      key: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      preview: URL.createObjectURL(f),
      originalBytes: f.size,
      status: "queued",
      caption: "",
    }));
    setItems((cur) => [...cur, ...fresh]);
    // Compress + upload three at a time.
    const queue = fresh.map((it, i) => ({ it, file: list[i] }));
    const worker = async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        patch(job.it.key, { status: "working" });
        try {
          const r = await uploadImage(job.file, "gallery", 2400);
          patch(job.it.key, { status: "done", url: r.url, width: r.width, height: r.height });
        } catch (e) {
          patch(job.it.key, { status: "error", error: e instanceof Error ? e.message : "Upload failed" });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Country" name="countryCode" required>
          <Select name="countryCode" value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Class" name="cohortId" hint="Leave as “Not a single class” for convenings, conferences and events.">
          <Select name="cohortId" defaultValue="" key={country}>
            <option value="">Not a single class</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Occasion" name="occasion" required>
          <Input name="occasion" list="occasions" defaultValue="Graduation" />
          <datalist id="occasions">
            {OCCASIONS.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed p-10 text-center transition-colors ${drag ? "border-green bg-green-tint" : "border-line bg-sand hover:border-ink/30"}`}
      >
        <ImagePlus className="size-8 text-slate" />
        <p className="font-extrabold">Drop photos here, or click to choose</p>
        <p className="max-w-md text-sm text-slate">
          Up to 100 at a time. Large photos are automatically resized to 2400px and compressed (typically 5–15 MB → under 1 MB) while staying sharp full-screen.
        </p>
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((it) => (
            <li key={it.key} className="overflow-hidden rounded-[10px] border border-line bg-white">
              <div className="relative aspect-[4/3] bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold">
                  {it.status === "done" && <CheckCircle2 className="size-3.5 text-green" />}
                  {(it.status === "working" || it.status === "queued") && <Loader2 className="size-3.5 animate-spin" />}
                  {it.status === "error" && <AlertCircle className="size-3.5 text-red" />}
                  {it.status === "done" ? "Ready" : it.status === "error" ? "Failed" : it.status === "working" ? "Compressing…" : "Waiting"}
                </span>
                <button
                  type="button"
                  onClick={() => setItems((cur) => cur.filter((x) => x.key !== it.key))}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95 hover:bg-red hover:text-white"
                  aria-label={`Remove ${it.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-1.5 p-2.5">
                <p className="truncate text-xs text-slate" title={it.name}>
                  {it.name} · {mb(it.originalBytes)}
                  {it.width ? ` → ${it.width}×${it.height}` : ""}
                </p>
                {it.error && <p className="text-xs font-semibold text-red">{it.error}</p>}
                <input
                  value={it.caption}
                  onChange={(e) => patch(it.key, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="w-full rounded-[6px] border border-line px-2 py-1.5 text-sm outline-none focus:border-green"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name="photos" value={JSON.stringify(done.map((d) => ({ url: d.url, width: d.width, height: d.height, caption: d.caption })))} />
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pending={pending || busy}>{busy ? "Processing photos…" : `Add ${done.length || ""} photo${done.length === 1 ? "" : "s"} to gallery`}</SubmitButton>
        {items.some((i) => i.status === "error") && <p className="text-sm font-semibold text-red">Failed photos are skipped — remove them or try again.</p>}
      </div>
    </form>
  );
}

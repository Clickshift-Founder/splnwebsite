"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/brand";

/** Uploads must stay under Vercel's 4.5 MB request limit — leave headroom. */
const TARGET_BYTES = 3.5 * 1024 * 1024;

export type Compressed = { blob: Blob; width: number; height: number };

/**
 * Shrinks a photo in the browser before upload, keeping it sharp: scale the long edge down to
 * `max` px (phones shoot 4000–6000 px), re-encode as WebP at high quality, and only step quality
 * down if the file is still too big. A 12 MB graduation photo typically lands at 400–900 KB.
 * EXIF orientation is honoured by createImageBitmap, so portraits stay upright.
 */
export async function compressImage(file: File, max = 2400): Promise<Compressed> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bmp) throw new Error(`"${file.name}" isn't an image this browser can read. Use JPEG, PNG or WebP.`);
  let scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  for (let attempt = 0; attempt < 6; attempt++) {
    const width = Math.round(bmp.width * scale);
    const height = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, width, height);
    for (const q of [0.88, 0.8, 0.72]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
      if (blob && blob.size <= TARGET_BYTES) return { blob, width, height };
    }
    scale *= 0.8; // still too big even at q=0.72 — reduce dimensions and retry
  }
  throw new Error(`"${file.name}" is too large to compress. Try a smaller image.`);
}

export async function uploadImage(file: File, folder: string, max: number): Promise<{ url: string; width: number; height: number }> {
  const { blob, width, height } = await compressImage(file, max);
  const fd = new FormData();
  fd.append("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }));
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return { url: json.url as string, width, height };
}

const upload = async (file: File, folder: string, max: number) => (await uploadImage(file, folder, max)).url;

/** Single image field. Writes the uploaded URL into a hidden input called `name`. */
export function ImageUpload({
  name,
  folder,
  defaultValue,
  label,
  hint,
  shape = "wide",
  max = 1800,
}: {
  name: string;
  folder: "profiles" | "spotlights" | "posts" | "gallery";
  defaultValue?: string | null;
  label: string;
  hint?: string;
  shape?: "square" | "wide";
  max?: number;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onPick(f?: File) {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      setUrl(await upload(f, folder, max));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-bold">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className={cn("relative overflow-hidden rounded-[12px] border-2 border-dashed border-line bg-sand", shape === "square" ? "size-44" : "aspect-[16/9] w-full max-w-xl")}>
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-ink shadow hover:bg-red hover:text-white"
              aria-label="Remove image"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate hover:text-ink"
          >
            {busy ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
            <span className="text-sm font-bold">{busy ? "Uploading…" : "Upload image"}</span>
          </button>
        )}
      </div>
      {url && (
        <button type="button" onClick={() => input.current?.click()} className="mt-2 text-sm font-bold text-green-deep hover:underline">
          {busy ? "Uploading…" : "Replace image"}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      {hint && <p className="mt-1.5 text-xs text-slate">{hint}</p>}
      {err && <p className="mt-1.5 text-sm font-semibold text-red">{err}</p>}
    </div>
  );
}

/** Multiple images with captions (spotlight evidence gallery). Serialised as JSON into `name`. */
export function GalleryUpload({ name, defaultValue = [] }: { name: string; defaultValue?: { url: string; caption?: string }[] }) {
  const [items, setItems] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 12).map((f) => upload(f, "gallery", 1800)));
      setItems((cur) => [...cur, ...urls.map((url) => ({ url, caption: "" }))]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.url} className="overflow-hidden rounded-[12px] border border-line bg-white">
            <div className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="" className="absolute inset-0 size-full object-cover" />
              <button
                type="button"
                onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95 shadow hover:bg-red hover:text-white"
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              value={it.caption ?? ""}
              onChange={(e) => setItems((cur) => cur.map((c, j) => (j === i ? { ...c, caption: e.target.value } : c)))}
              placeholder="Caption / what this shows"
              className="w-full border-t border-line px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-line bg-sand text-slate hover:text-ink"
        >
          {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          <span className="text-sm font-bold">{busy ? "Uploading…" : "Add evidence photos"}</span>
        </button>
      </div>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => onPick(e.target.files)} />
      {err && <p className="mt-1.5 text-sm font-semibold text-red">{err}</p>}
    </div>
  );
}

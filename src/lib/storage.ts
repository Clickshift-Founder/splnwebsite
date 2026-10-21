import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Stores an image in Vercel Blob (prod) or public/uploads (dev). Returns its public URL. */
export async function storeImage(file: File, folder: string): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const name = `${safeFolder}/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Uploads are not configured (BLOB_READ_WRITE_TOKEN).");
  await mkdir(path.join(process.cwd(), "public", "uploads", safeFolder), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Best-effort delete of a file we stored (Blob or local dev upload). Never throws. */
export async function deleteStored(url: string) {
  try {
    if (/\.public\.blob\.vercel-storage\.com\//.test(url) && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    } else if (url.startsWith("/uploads/")) {
      const { unlink } = await import("node:fs/promises");
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (e) {
    console.error("[storage] delete failed", url, e);
  }
}

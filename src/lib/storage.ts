import "server-only";
import { del, put } from "@vercel/blob";
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

/** An upload problem the person can fix themselves; its message is safe to show them. */
export class UploadError extends Error {}

/** The project's Blob store ("spln-uploads"). Used when Vercel connects the store via OIDC without setting BLOB_STORE_ID. */
const DEFAULT_BLOB_STORE_ID = "store_y2ixjz1N1je5Pmy5";

/**
 * Vercel Blob credentials. Stores connected to the project authenticate with Vercel's OIDC token
 * (+ store id) and get no BLOB_READ_WRITE_TOKEN; older stores (and local dev) use the token.
 */
function blobAuth(): { storeId?: string } {
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) return {};
  return { storeId: DEFAULT_BLOB_STORE_ID };
}
const blobEnabled = () => Boolean(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/** Stores an image in Vercel Blob (prod) or public/uploads (dev). Returns its public URL. */
export async function storeImage(file: File, folder: string): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new UploadError("Only JPEG, PNG, WebP or AVIF images are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Images must be 5 MB or smaller.");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const name = `${safeFolder}/${randomUUID()}.${ext}`;

  if (blobEnabled()) {
    const blob = await put(name, file, { access: "public", contentType: file.type, ...blobAuth() });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") throw new Error("No Vercel Blob credentials (BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID).");
  await mkdir(path.join(process.cwd(), "public", "uploads", safeFolder), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Best-effort delete of a file we stored (Blob or local dev upload). Never throws. */
export async function deleteStored(url: string) {
  try {
    if (/\.public\.blob\.vercel-storage\.com\//.test(url) && blobEnabled()) {
      await del(url, blobAuth());
    } else if (url.startsWith("/uploads/")) {
      const { unlink } = await import("node:fs/promises");
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (e) {
    console.error("[storage] delete failed", url, e);
  }
}

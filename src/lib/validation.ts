import { z } from "zod";
import { normaliseSocialUrl } from "./text";

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => v || null)
    .nullable()
    .optional();

const isHttpUrl = (v: string) => {
  try {
    return ["https:", "http:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

/** Images must come from our own storage (local dev uploads or Vercel Blob). */
export const storedImage = z
  .string()
  .trim()
  .refine((v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(v), "Upload the image using the uploader.")
  .transform((v) => v || null)
  .nullable()
  .optional();

const social = (kind: "x" | "linkedin" | "facebook", hosts: string[]) =>
  z
    .string()
    .trim()
    .max(200)
    .transform((v) => normaliseSocialUrl(v, kind))
    .refine((v) => !v || (isHttpUrl(v) && hosts.some((h) => new URL(v).hostname.replace(/^www\./, "").endsWith(h))), `Enter a valid ${kind === "x" ? "X" : kind === "linkedin" ? "LinkedIn" : "Facebook"} profile link.`)
    .nullable()
    .optional();

export const profileSchema = z.object({
  headline: optText(120),
  location: optText(80),
  bio: optText(1500),
  photoUrl: storedImage,
  linkedinUrl: social("linkedin", ["linkedin.com"]),
  xUrl: social("x", ["x.com", "twitter.com"]),
  facebookUrl: social("facebook", ["facebook.com", "fb.com"]),
});

export const memberPostSchema = z.object({
  title: z.string().trim().min(8, "Give your piece a clear title.").max(160),
  type: z.enum(["article", "thought_leadership"]),
  topic: optText(60),
  excerpt: z.string().trim().min(40, "Write a 1–2 sentence summary (at least 40 characters).").max(320),
  body: z.string().trim().min(800, "Articles should be at least ~150 words (800 characters).").max(40000),
  coverUrl: storedImage,
  sources: z.string().trim().min(10, "List the sources for your facts and figures.").max(5000),
});

export const adminPostSchema = memberPostSchema.extend({
  type: z.enum(["news", "article", "thought_leadership"]),
  sources: z.string().trim().max(5000).optional().default(""),
  body: z.string().trim().min(20).max(60000),
  excerpt: z.string().trim().max(320).optional().default(""),
  authorName: optText(80),
  featured: z.coerce.boolean().optional().default(false),
});

const evidenceLinks = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [url, ...label] = l.split(/\s+\|\s+|\s+—\s+/);
        return { url: url.trim(), label: label.join(" ").trim() || undefined };
      }),
  )
  .refine((links) => links.every((l) => isHttpUrl(l.url)), "Each evidence line must start with a full link (https://…).");

const gallery = z
  .string()
  .optional()
  .transform((v, ctx) => {
    try {
      const arr = JSON.parse(v || "[]") as { url: string; caption?: string }[];
      return arr.filter((i) => typeof i.url === "string").map((i) => ({ url: i.url, caption: (i.caption ?? "").slice(0, 200) || undefined }));
    } catch {
      ctx.addIssue({ code: "custom", message: "Gallery data is invalid." });
      return z.NEVER;
    }
  });

export const spotlightSchema = z.object({
  graduateId: z.coerce.number().int().positive("Select the graduate this story is about."),
  category: z.string().trim().min(2).max(60),
  title: z.string().trim().min(8, "Add a headline.").max(160),
  summary: optText(320),
  story: z.string().trim().min(80, "Tell the story — at least a short paragraph.").max(40000),
  coverUrl: storedImage,
  gallery,
  evidenceLinks,
  isPublished: z.coerce.boolean().optional().default(false),
  featured: z.coerce.boolean().optional().default(false),
});

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

/** FormData → plain object, with checkbox "on" → true. */
export function formToObject(form: FormData): Record<string, string | boolean> {
  const o: Record<string, string | boolean> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") o[k] = v === "on" ? true : v;
  return o;
}

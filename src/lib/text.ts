/** Shared, dependency-free text helpers (safe for scripts, server and client). */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const KEEP_LOWER = new Set(["de", "da", "du", "van", "von", "bin", "binti", "al", "el", "la", "le"]);

const ROMAN = /^(I{1,3}|IV|VI{0,3}|IX|X{1,3})$/;

const titleWord = (w: string) => w.toLowerCase().replace(/(^|[-'’(])([a-z])/g, (_, sep: string, c: string) => sep + c.toUpperCase());

/**
 * Normalise a person's name from the registry: collapse whitespace and fix SHOUTED
 * words ("ALIYU Adamu" → "Aliyu Adamu") and all-lowercase names. Deliberate mixed
 * case survives ("McDonald", "ThankGod", "(PhD)"), as do roman numerals ("Nweke II").
 */
export function cleanName(raw: string): string {
  const name = raw.replace(/\s+/g, " ").trim();
  const letters = name.replace(/[^a-zA-Z]/g, "");
  const allLower = letters === letters.toLowerCase();
  return name
    .split(" ")
    .map((w, i) => {
      const core = w.replace(/[^a-zA-Z]/g, "");
      if (i > 0 && KEEP_LOWER.has(w.toLowerCase()) && (allLower || core === core.toUpperCase())) return w.toLowerCase();
      if (ROMAN.test(core) && i > 0) return w;
      const shouted = core.length >= 2 && core === core.toUpperCase();
      return shouted || allLower ? titleWord(w) : w;
    })
    .join(" ");
}

export function initials(name: string): string {
  // Skip suffixes like "(PhD)" and "II" so "Frank Nweke II" → FN.
  const parts = name
    .split(" ")
    .filter((w) => !w.startsWith("(") && !ROMAN.test(w))
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Accepts "x.com/handle", "@handle", "https://…" and returns a full https URL (or null). */
export function normaliseSocialUrl(value: string | null | undefined, kind: "x" | "linkedin" | "facebook"): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v.replace(/^http:/i, "https:");
  const handle = v.replace(/^@/, "");
  if (/\.(com|org)\//i.test(handle)) return `https://${handle}`;
  const base = { x: "https://x.com/", linkedin: "https://www.linkedin.com/in/", facebook: "https://www.facebook.com/" }[kind];
  return base + handle;
}

export function readingTime(markdown: string): number {
  return Math.max(1, Math.round(markdown.split(/\s+/).length / 220));
}

export function formatDate(d: Date | string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", opts).format(new Date(d));
}

/** Only allow same-site relative redirects (blocks //evil.com and absolute URLs). */
export function safeNext(n: unknown, fallback = "/member/profile"): string {
  return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : fallback;
}

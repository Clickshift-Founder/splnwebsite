import clsx, { type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export type Accent = "green" | "blue" | "red" | "amber";
const CYCLE: Accent[] = ["green", "blue", "red", "amber"];

/** BRAND.md §3 country accents. New countries cycle the four frame colours. */
const COUNTRY_ACCENT: Record<string, Accent> = { NG: "green", KE: "blue", SN: "red", GH: "amber" };

export function countryAccent(code: string | null | undefined, index = 0): Accent {
  return (code && COUNTRY_ACCENT[code]) || CYCLE[index % 4];
}

export const ACCENT_HEX: Record<Accent, string> = {
  green: "#05AF4B",
  blue: "#009CD9",
  red: "#D80A15",
  amber: "#F2A421",
};

/** Static class maps so Tailwind can see every class at build time. */
export const ACCENT_BG: Record<Accent, string> = {
  green: "bg-green",
  blue: "bg-blue",
  red: "bg-red",
  amber: "bg-amber",
};
export const ACCENT_TEXT: Record<Accent, string> = {
  green: "text-green-deep",
  blue: "text-blue",
  red: "text-red",
  amber: "text-amber",
};
export const ACCENT_TINT: Record<Accent, string> = {
  green: "bg-green-tint text-green-deep",
  blue: "bg-blue-tint text-blue",
  red: "bg-red-tint text-red",
  amber: "bg-amber-tint text-[#9a6200]",
};

export const OFFICE_LABEL: Record<string, string> = {
  aspirant: "Aspirant",
  candidate: "Candidate",
  appointed: "Appointed",
  elected: "Elected",
};

export const POST_STATUS: Record<string, { label: string; accent?: "green" | "blue" | "red" | "amber" }> = {
  draft: { label: "Draft" },
  pending: { label: "Awaiting review", accent: "amber" },
  changes_requested: { label: "Changes requested", accent: "blue" },
  published: { label: "Published", accent: "green" },
  rejected: { label: "Not accepted", accent: "red" },
};

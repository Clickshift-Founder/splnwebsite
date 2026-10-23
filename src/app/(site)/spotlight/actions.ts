"use server";

import { z } from "zod";
import { db } from "@/db";
import { nominations } from "@/db/schema";
import { getMember } from "@/lib/auth";
import { notifyNewNomination } from "@/lib/notify";
import { fieldErrors, formToObject } from "@/lib/validation";
import type { ActionResult } from "@/components/ui/form";

const nominationSchema = z.object({
  nomineeName: z.string().trim().min(3, "Who are you nominating?").max(120),
  nominatorName: z.string().trim().min(2, "Tell us your name.").max(120),
  nominatorEmail: z.string().trim().toLowerCase().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email."),
  reason: z.string().trim().min(40, "Tell us a little more (at least a couple of sentences).").max(3000),
  evidenceUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\//.test(v), "Links must start with https://")
    .optional(),
});

export async function submitNomination(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  if (form.get("website")) return { ok: true, message: "Thank you." }; // honeypot
  const parsed = nominationSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, error: "Please check the form.", fieldErrors: fieldErrors(parsed.error) };

  const member = await getMember();
  await db.insert(nominations).values({
    ...parsed.data,
    evidenceUrl: parsed.data.evidenceUrl || null,
    reason: member ? `[Submitted by verified graduate #${member.id}]\n${parsed.data.reason}` : parsed.data.reason,
  });
  notifyNewNomination(parsed.data.nomineeName, parsed.data.nominatorName);
  return { ok: true, message: "Thank you — the SPLN team will review your nomination and reach out to the graduate for consent." };
}

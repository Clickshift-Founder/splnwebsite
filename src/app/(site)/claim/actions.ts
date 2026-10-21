"use server";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { graduates, verificationCodes } from "@/db/schema";
import { startMemberSession, endMemberSession } from "@/lib/auth";
import { codeEmail, sendEmail } from "@/lib/email";
import { audit } from "@/lib/audit";
import { normaliseEmail, safeNext } from "@/lib/text";

export type ClaimState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; masked: string; error?: string; devNote?: string };

const CODE_TTL_MIN = 15;
const MAX_SENDS = 3;
const MAX_ATTEMPTS = 5;

const hashCode = (code: string, graduateId: number) =>
  createHash("sha256").update(`${code}:${graduateId}:${process.env.AUTH_SECRET ?? "dev"}`).digest("hex");

const maskEmail = (e: string) => {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}${"•".repeat(Math.max(2, u.length - 2))}@${d}`;
};

/** Matches the primary email or any address in alt_emails (comma-separated). */
function emailMatches(email: string) {
  return or(eq(graduates.email, email), sql`(',' || coalesce(${graduates.altEmails}, '') || ',') like ${`%,${email},%`}`);
}

export async function requestCode(_prev: ClaimState, form: FormData): Promise<ClaimState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const profile = String(form.get("profile") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { step: "email", error: "Enter a valid email address." };

  let grad: { id: number; fullName: string } | undefined;
  if (profile) {
    [grad] = await db
      .select({ id: graduates.id, fullName: graduates.fullName })
      .from(graduates)
      .where(and(eq(graduates.slug, profile), emailMatches(email)));
    if (!grad)
      return {
        step: "email",
        error: "That email doesn't match the one SPPG holds for this profile. Use the address you registered with at SPPG — or contact the SPLN Secretariat if it has changed.",
      };
  } else {
    [grad] = await db.select({ id: graduates.id, fullName: graduates.fullName }).from(graduates).where(emailMatches(email));
    if (!grad)
      return {
        step: "email",
        error: "We couldn't find that email on the SPPG graduate register. Use the address you registered with at SPPG — or contact the SPLN Secretariat.",
      };
  }

  const since = new Date(Date.now() - CODE_TTL_MIN * 60_000);
  const recent = await db.$count(verificationCodes, and(eq(verificationCodes.graduateId, grad.id), gt(verificationCodes.createdAt, since)));
  if (recent >= MAX_SENDS) return { step: "email", error: "Too many codes requested. Please wait 15 minutes and try again." };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert(verificationCodes).values({
    graduateId: grad.id,
    codeHash: hashCode(code, grad.id),
    expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60_000),
  });

  const sent = await sendEmail({ to: email, ...codeEmail(grad.fullName, code) });
  if (!sent.ok) return { step: "email", error: "We couldn't send the email just now. Please try again shortly." };

  return {
    step: "code",
    email,
    masked: maskEmail(email),
    devNote: !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production" ? "Dev mode: the code was printed in the server console." : undefined,
  };
}

export async function verifyCode(prev: ClaimState, form: FormData): Promise<ClaimState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  const masked = prev.step === "code" ? prev.masked : maskEmail(email);
  if (code.length !== 6) return { step: "code", email, masked, error: "Enter the 6-digit code from your email." };

  const [grad] = await db.select({ id: graduates.id, claimed: graduates.profileClaimedAt }).from(graduates).where(emailMatches(email));
  if (!grad) return { step: "email", error: "Something went wrong. Please start again." };

  const [row] = await db
    .select()
    .from(verificationCodes)
    .where(and(eq(verificationCodes.graduateId, grad.id), isNull(verificationCodes.usedAt), gt(verificationCodes.expiresAt, new Date())))
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (!row) return { step: "code", email, masked, error: "That code has expired. Request a new one." };
  if (row.attempts >= MAX_ATTEMPTS) return { step: "code", email, masked, error: "Too many attempts. Request a new code." };

  const a = Buffer.from(row.codeHash, "hex");
  const b = Buffer.from(hashCode(code, grad.id), "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.update(verificationCodes).set({ attempts: row.attempts + 1 }).where(eq(verificationCodes.id, row.id));
    return { step: "code", email, masked, error: `That code isn't right. ${MAX_ATTEMPTS - row.attempts - 1} attempts left.` };
  }

  await db.update(verificationCodes).set({ usedAt: new Date() }).where(eq(verificationCodes.id, row.id));
  if (!grad.claimed) await db.update(graduates).set({ profileClaimedAt: new Date() }).where(eq(graduates.id, grad.id));
  await startMemberSession(grad.id);
  await audit(`graduate:${grad.id}`, "member.sign_in");
  redirect(safeNext(form.get("next")));
}

export async function signOutMember() {
  await endMemberSession();
  redirect("/");
}

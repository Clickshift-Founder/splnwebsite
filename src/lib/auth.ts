import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, graduates } from "@/db/schema";
import { ADMIN_COOKIE, MEMBER_COOKIE, signSession, verifySession } from "./session-token";

const ADMIN_MAX_AGE = 60 * 60 * 10; // 10 hours
const MEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

/* ── Admin ── */

export async function startAdminSession(adminId: number) {
  const token = await signSession({ kind: "admin", sub: String(adminId) }, ADMIN_MAX_AGE);
  (await cookies()).set(ADMIN_COOKIE, token, cookieOpts(ADMIN_MAX_AGE));
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function getAdmin() {
  const s = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value, "admin");
  if (!s) return null;
  const [a] = await db
    .select({ id: admins.id, name: admins.name, email: admins.email, role: admins.role })
    .from(admins)
    .where(and(eq(admins.id, Number(s.sub)), eq(admins.isActive, true)));
  return a ?? null;
}

/** Use at the top of every admin page AND every admin server action. */
export async function requireAdmin(role?: "super_admin") {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  if (role && a.role !== role) redirect("/admin?denied=1");
  return a;
}

/* ── Member (verified graduate) ── */

export async function startMemberSession(graduateId: number) {
  const token = await signSession({ kind: "member", sub: String(graduateId) }, MEMBER_MAX_AGE);
  (await cookies()).set(MEMBER_COOKIE, token, cookieOpts(MEMBER_MAX_AGE));
}

export async function endMemberSession() {
  (await cookies()).delete(MEMBER_COOKIE);
}

export async function getMember() {
  const s = await verifySession((await cookies()).get(MEMBER_COOKIE)?.value, "member");
  if (!s) return null;
  const [g] = await db
    .select({ id: graduates.id, slug: graduates.slug, fullName: graduates.fullName, photoUrl: graduates.photoUrl, isHidden: graduates.isHidden })
    .from(graduates)
    .where(eq(graduates.id, Number(s.sub)));
  return g ?? null;
}

/** Use at the top of every member page AND every member server action. */
export async function requireMember(next = "/member") {
  const m = await getMember();
  if (!m) redirect(`/claim?next=${encodeURIComponent(next)}`);
  return m;
}

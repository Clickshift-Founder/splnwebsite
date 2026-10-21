// Edge-safe JWT helpers (used by middleware and server code). No DB, no Node APIs.
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "spln_admin";
export const MEMBER_COOKIE = "spln_member";

export type SessionPayload = { kind: "admin"; sub: string } | { kind: "member"; sub: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set in production");
  return new TextEncoder().encode(s || "dev-only-insecure-secret-change-me-dev-only-insecure");
}

export async function signSession(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT({ kind: payload.kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secret());
}

export async function verifySession(token: string | undefined, kind: SessionPayload["kind"]): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.kind !== kind || !payload.sub) return null;
    return { kind, sub: payload.sub };
  } catch {
    return null;
  }
}

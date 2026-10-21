import "server-only";
import { db } from "@/db";
import { auditLog } from "@/db/schema";

export async function audit(actor: string, action: string, target?: string, meta?: Record<string, unknown>) {
  try {
    await db.insert(auditLog).values({ actor, action, target, meta });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}

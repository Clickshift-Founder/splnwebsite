// Usage: npm run admin:create -- "Full Name" email@example.com "password" [super_admin|editor]
// With no args, uses ADMIN_EMAIL / ADMIN_PASSWORD from env as a super_admin.
import "./_env";
import bcrypt from "bcryptjs";
import { createDb } from "../src/db/connect";
import { admins } from "../src/db/schema";
import { normaliseEmail } from "../src/lib/text";

export async function upsertAdmin(name: string, email: string, password: string, role: "super_admin" | "editor") {
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  const db = createDb();
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(admins)
    .values({ name, email: normaliseEmail(email), passwordHash, role })
    .onConflictDoUpdate({ target: admins.email, set: { passwordHash, role, name, isActive: true } });
  console.log(`✓ Admin ready: ${normaliseEmail(email)} (${role})`);
}

if (process.argv[1]?.includes("create-admin")) {
  const [name, email, password, role] = process.argv.slice(2);
  const e = email ?? process.env.ADMIN_EMAIL;
  const p = password ?? process.env.ADMIN_PASSWORD;
  if (!e || !p) {
    console.error("Provide args or set ADMIN_EMAIL and ADMIN_PASSWORD.");
    process.exit(1);
  }
  upsertAdmin(name ?? "SPLN Director", e, p, (role as "super_admin" | "editor") ?? "super_admin")
    .then(() => process.exit(0))
    .catch((err) => { console.error(err.message); process.exit(1); });
}

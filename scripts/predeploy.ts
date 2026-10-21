// Runs automatically before `next build` (npm "prebuild" hook).
// On Vercel: applies database migrations and inserts baseline data, so every deploy
// ships with an up-to-date schema. Locally: does nothing (run db:* scripts yourself).
import "./_env";
import { createDb, databaseUrl, isNeonUrl } from "../src/db/connect";
import { seedBaseline } from "./seed";

async function main() {
  if (!process.env.VERCEL) {
    console.log("[predeploy] Not on Vercel — skipping migrations (use npm run db:migrate locally).");
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("[predeploy] DATABASE_URL is not set. In Vercel: Storage → connect a Neon database to this project, then redeploy.");
  }
  const db = createDb();
  if (isNeonUrl(databaseUrl())) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(db, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  }
  console.log("[predeploy] ✓ Migrations applied");
  await seedBaseline(db);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

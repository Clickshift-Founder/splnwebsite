import "./_env";
import { createDb, databaseUrl, isNeonUrl } from "../src/db/connect";

async function main() {
  const db = createDb();
  const neon = isNeonUrl(databaseUrl());
  if (neon) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(db, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  }
  console.log(`✓ Migrations applied (${neon ? "Neon" : databaseUrl().replace(/:[^:@/]+@/, ":•••@")})`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

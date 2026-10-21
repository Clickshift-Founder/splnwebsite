// Local Postgres for development: PGlite (real Postgres compiled to WASM) persisted in ./.data/pglite,
// served on 127.0.0.1:54329 so the app, migrations and seeds all connect like to any Postgres.
// Usage: `npm run db:dev` (keep it running), or `npm run dev:local` to start it together with Next.
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.PGLITE_PORT ?? 54329);
const DIR = process.env.PGLITE_DIR ?? "./.data/pglite";
mkdirSync(DIR, { recursive: true });

const db = await PGlite.create(DIR);
// Next dev opens a connection per server bundle and keeps them idle; queries are serialised by PGlite anyway.
const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1", maxConnections: 64, debug: !!process.env.PGLITE_DEBUG });
await server.start();
console.log(`[db:dev] PGlite ready on postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

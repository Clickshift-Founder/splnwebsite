import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

/** Local dev database served by `npm run db:dev` (PGlite over the Postgres wire protocol). */
export const LOCAL_DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:54329/postgres";

export const isNeonUrl = (url: string) => /neon\.tech|neon\.database|\.neon\./i.test(url);

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL must be set in production");
  return LOCAL_DATABASE_URL;
}

/**
 * Neon URL  → Neon serverless driver over HTTP (production on Vercel).
 * Any other → postgres.js (local PGlite server from `npm run db:dev`, Supabase, Docker…).
 *
 * NOTE: neon-http has no interactive transactions — write code that doesn't need them.
 */
export function createDb(): DB {
  const url = databaseUrl();
  if (isNeonUrl(url)) return drizzleNeon(neon(url), { schema });
  const local = url === LOCAL_DATABASE_URL || /127\.0\.0\.1|localhost/.test(url);
  // Locally one connection per server bundle (PGlite serialises queries); real Postgres gets a small pool.
  const client = postgres(url, { max: local ? 1 : 5, prepare: !local, idle_timeout: 20, onnotice: () => {} });
  return drizzlePg(client, { schema }) as unknown as DB;
}

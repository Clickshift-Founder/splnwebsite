import { defineConfig } from "drizzle-kit";

// Migrations are generated from src/db/schema.ts and applied by scripts/migrate.ts,
// which targets Neon (DATABASE_URL set) or local PGlite (unset).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});

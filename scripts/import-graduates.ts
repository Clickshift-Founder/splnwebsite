// Usage: npm run db:import-graduates -- [path/to/registry.csv]   (default: data/private/graduates.csv)
import "./_env";
import { readFileSync } from "node:fs";
import { createDb } from "../src/db/connect";
import { importGraduatesCsv } from "../src/lib/graduate-import";

async function main() {
  const path = process.argv[2] ?? "data/private/graduates.csv";
  const res = await importGraduatesCsv(createDb(), readFileSync(path, "utf8"));
  console.log(`✓ Graduates — created ${res.created}, updated ${res.updated}, skipped ${res.skipped.length}`);
  for (const s of res.skipped.slice(0, 50)) console.log(`  skipped row ${s.row}: ${s.reason}`);
  for (const w of res.warnings.slice(0, 50)) console.log(`  warning row ${w.row}: ${w.reason}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });

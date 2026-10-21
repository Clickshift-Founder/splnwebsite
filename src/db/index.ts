import "server-only";
import { createDb, type DB } from "./connect";
import * as schema from "./schema";

const g = globalThis as unknown as { __splnDb?: DB };
export const db: DB = g.__splnDb ?? (g.__splnDb = createDb());
export { schema };
export type { DB };

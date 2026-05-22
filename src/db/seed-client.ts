import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import * as relations from "./schema/_relations";

config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const sql = postgres(databaseUrl, {
  prepare: false,
  max: 1,
});

export const db = drizzle(sql, {
  schema: { ...schema, ...relations },
});

export { sql };

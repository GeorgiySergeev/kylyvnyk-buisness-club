import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";
import * as relations from "./schema/_relations";

const sql = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 10,
  idle_timeout: 30,
});

const db = drizzle(sql, {
  schema: { ...schema, ...relations },
  logger: env.NODE_ENV === "development",
});

type DB = typeof db;

export { type DB,db };

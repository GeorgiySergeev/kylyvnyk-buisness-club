import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

const sql = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 10,
  idle_timeout: 30,
});

const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

type DB = typeof db;

export { db, type DB };

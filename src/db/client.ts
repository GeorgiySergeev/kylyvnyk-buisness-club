/* eslint-disable no-undef */
import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";
import * as relations from "./schema/_relations";

const createClient = () => {
  const sql = postgres(env.DATABASE_URL, {
    prepare: false,
    max: 10,
    idle_timeout: 30,
  });

  return drizzle(sql, {
    schema: { ...schema, ...relations },
    logger: env.NODE_ENV === "development",
  });
};

type DbClient = ReturnType<typeof createClient>;

const globalForDb = globalThis as typeof globalThis & {
  __db__?: DbClient;
};

const db = globalForDb.__db__ ?? createClient();

if (env.NODE_ENV !== "production") {
  globalForDb.__db__ = db;
}

type DB = typeof db;

export { type DB, db };

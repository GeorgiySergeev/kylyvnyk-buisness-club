/* eslint-disable no-undef */
import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";
import * as relations from "./schema/_relations";

function resolvePoolMax(databaseUrl: string): number {
  try {
    const limit = new URL(databaseUrl).searchParams.get("connection_limit");
    if (limit) {
      const parsed = Number.parseInt(limit, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {
    // Fall through to the safe default for Supabase transaction pooler URLs.
  }

  return 1;
}

function resolveRuntimeDatabaseUrl(): string {
  // Local `next dev` is a long-running Node process. Supabase transaction pooler
  // (6543, connection_limit=1) serialises every query and stalls navigation.
  // Session/direct URL (5432) is already in every dev `.env.local` for drizzle-kit.
  if (env.NODE_ENV === 'development') {
    return env.DATABASE_URL_DIRECT;
  }

  return env.DATABASE_URL;
}

function isTransactionPoolerUrl(databaseUrl: string): boolean {
  try {
    const parsed = new URL(databaseUrl);
    return parsed.port === '6543' || parsed.searchParams.get('pgbouncer') === 'true';
  } catch {
    return databaseUrl.includes(':6543') || databaseUrl.includes('pgbouncer=true');
  }
}

const createClient = () => {
  const databaseUrl = resolveRuntimeDatabaseUrl();
  const transactionPooler = isTransactionPoolerUrl(databaseUrl);

  // ADR-003 / docs/ENV.md: production DATABASE_URL uses Supavisor transaction
  // mode with `connection_limit=1`. postgres-js `max` MUST match that limit.
  const sql = postgres(databaseUrl, {
    prepare: false,
    fetch_types: !transactionPooler,
    max: transactionPooler ? resolvePoolMax(databaseUrl) : 5,
    idle_timeout: 300,
    max_lifetime: 60 * 10,
    connect_timeout: 15,
    connection: {
      statement_timeout: 15_000,
    },
  });

  return drizzle(sql, {
    schema: { ...schema, ...relations },
    logger: false,
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

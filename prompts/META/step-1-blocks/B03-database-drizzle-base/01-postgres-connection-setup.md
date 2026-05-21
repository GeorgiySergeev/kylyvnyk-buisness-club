01-postgres-connection-setup.md
Title
Postgres Connection (Neon/Supabase) — pg + Drizzle bootstrap

Objective
Install Postgres driver and create a reusable db connection for Server Components and Server Actions. Centralize connection pool and avoid HMR leaks in dev.

Prereqs
DATABASE_URL in .env (from B02)
Steps
Install dependencies: pg
Create a shared Pool and Drizzle instance (src/db/config.ts)
Re-export db from src/lib/db for ergonomic imports
Add SSL toggle for production (Neon/Supabase)
Commands
bash

copy
pnpm add pg drizzle-orm
Files to add/modify
src/db/config.ts
src/lib/db/index.ts
src/db/config.ts
ts

copy
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
throw new Error('DATABASE_URL is not set');
}

// Avoid creating multiple pools in dev (Next.js HMR)
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
globalForDb.pool ??
new Pool({
connectionString,
ssl:
process.env.NODE_ENV === 'production'
? { rejectUnauthorized: false }
: undefined,
});

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = drizzle(pool);
src/lib/db/index.ts
ts

copy
export { db, pool } from '@/db/config';

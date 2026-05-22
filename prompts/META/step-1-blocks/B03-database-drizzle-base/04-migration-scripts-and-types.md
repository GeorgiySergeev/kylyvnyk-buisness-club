 # 04-migration-scripts-and-types.md
Title
Drizzle migrations — generate, apply, and types

Objective
Enable end-to-end migration flow (generate SQL from schema, apply to DB), and optional programmatic runner.

Steps
Ensure drizzle.config.ts is correct
Run generate to produce SQL from schema
Apply migrations
Optionally add a Node runner for CI/local (src/db/run-migrate.ts)
Commands
bash

copy
pnpm db:generate
pnpm db:migrate
Optional file
src/db/run-migrate.ts
src/db/run-migrate.ts (optional)
ts

copy
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function main() {
const pool = new Pool({
connectionString: process.env.DATABASE_URL!,
ssl:
process.env.NODE_ENV === 'production'
? { rejectUnauthorized: false }
: undefined,
});
const db = drizzle(pool);
await migrate(db, { migrationsFolder: './drizzle' });
await pool.end();
console.log('Migrations applied');
}

main().catch((e) => {
console.error(e);
process.exit(1);
});
package.json (scripts — optional)
json

copy
{
"scripts": {
"db:migrate:node": "tsx src/db/run-migrate.ts"
}
}
Acceptance

./drizzle contains SQL migration files
Migrations apply without errors to target DB

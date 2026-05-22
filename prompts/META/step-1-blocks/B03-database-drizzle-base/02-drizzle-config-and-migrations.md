02-drizzle-config-and-migrations.md

> **Superseded-By:** ADR-003 + `docs/sprints/kclub--mvp--sprint-3.md` B03.01 — use `DATABASE_URL_DIRECT` in `drizzle.config.ts` (via `dotenv/config`, not `@/lib/env`), pooled `DATABASE_URL` + `prepare: false` in `src/db/client.ts`.

Title
Drizzle ORM — config and migration scaffolding

Objective
Configure Drizzle Kit for Postgres, wire schema entrypoint and migrations output directory.

Steps
Install dev dependencies: drizzle-kit, dotenv
Create drizzle.config.ts at repo root
Ensure schema entrypoint points to src/db/schema/index.ts
Create migrations folder path (./drizzle)
Commands
bash

copy
pnpm add -D drizzle-kit dotenv
Files to add/modify
drizzle.config.ts
package.json (scripts)
drizzle.config.ts
ts

copy
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
schema: './src/db/schema/index.ts',
out: './drizzle',
dialect: 'postgresql',
dbCredentials: {
url: process.env.DATABASE_URL!,
},
strict: true,
verbose: true,
});
package.json (scripts — append)
json

copy
{
"scripts": {
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
}
}

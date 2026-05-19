03-initial-empty-schemas.md
Title
Schema Entrypoint — file layout for Drizzle schema

Objective
Create schema module structure. If Step 2 (DDL) is already merged, only ensure index.ts exports are correct.

Steps
Create folders and empty module files if missing
Add index.ts that re-exports schema modules
If Step 2 DDL exists, DO NOT overwrite — just validate exports
Files to add/validate
src/db/schema/
enums.ts
user.ts
geo.ts
catalog.ts
membership.ts
stripe.ts
audit.ts
index.ts
src/db/schema/index.ts
ts

copy
// Centralized exports for Drizzle Kit
export *from './enums';
export* from './user';
export *from './geo';
export* from './catalog';
export *from './membership';
export* from './stripe';
export * from './audit';
Notes

Keep files present even if initially minimal; Step 2 provides full DDL content.
Do not commit placeholder tables if Step 2 is already applied.

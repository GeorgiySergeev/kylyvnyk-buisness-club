# B03: Database & Drizzle Base

## Overview

This block outlines the foundational steps for setting up the PostgreSQL database and integrating Drizzle ORM into the **KYLYVNYK CLUB** project. 

The focus is on establishing a robust, scalable, and type-safe database layer that works seamlessly with Next.js App Router features like React Server Components (RSC) and Server Actions.

## Steps

1. **[01. Postgres Connection Setup](./01-postgres-connection-setup.md)**
   Install the Postgres driver (`pg`) and instantiate a reusable database connection pool. Centralize the Drizzle instance to avoid HMR connection leaks in development.

2. **[02. Drizzle Config & Migrations](./02-drizzle-config-and-migrations.md)**
   Configure Drizzle Kit for Postgres, specifying the schema entry point and the output directory for migrations.

3. **[03. Initial Schema Layout](./03-initial-empty-schemas.md)**
   Establish the file and folder structure for the database schemas (`users`, `geo`, `catalog`, etc.) and set up the centralized `index.ts` exporter.

4. **[04. Migration Scripts & Types](./04-migration-scripts-and-types.md)**
   Enable the end-to-end migration flow to generate SQL files from the TypeScript schema and apply them to the target database. Includes a programmatic Node migration runner.

5. **[05. DB Access in RSC & Server Actions](./05-db-access-in-rsc-server-actions.md)**
   Define safe, type-first patterns for interacting with the database. Includes examples of read-only queries for RSCs and mutation patterns via Server Actions with Zod validation.

6. **[06. Indexes & Constraints Plan](./06-indexes-and-constraints-plan.md)**
   Document and validate critical database indexes and constraints necessary for data integrity and optimized queries (e.g., unique constraints on emails and slugs, composite indexes).

## Overall Acceptance Criteria

Upon completion of this block:
- The Drizzle ORM is successfully connected to the PostgreSQL database via a connection pool.
- Drizzle Kit is fully configured to read the schema and generate/apply migrations.
- The schema directory is properly structured and exported.
- Database access patterns for both RSC (reads) and Server Actions (writes) are established and type-safe.
- Essential database indexes and constraints are documented and validated against the schema.

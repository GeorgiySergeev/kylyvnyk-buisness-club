import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import postgres from 'postgres';
import { describe, expect, it } from 'vitest';

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

function requireSafeTestDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const databaseName = parsed.pathname.replace(/^\//, '').toLowerCase();

  if (!/test|ci|scratch/.test(databaseName)) {
    throw new Error(
      'TEST_DATABASE_URL must point to a disposable database whose name contains test, ci, or scratch.',
    );
  }
}

function readMigrationStatements() {
  const drizzleDir = join(process.cwd(), 'drizzle');

  return readdirSync(drizzleDir)
    .filter((file) => /^\d+_.*\.sql$/.test(file))
    .sort()
    .flatMap((file) => {
      const sql = readFileSync(join(drizzleDir, file), 'utf8');

      return sql
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean)
        .map((statement) => ({ file, statement }));
    });
}

const runOrSkip = testDatabaseUrl ? describe : describe.skip;

runOrSkip('database migrations', () => {
  it('apply to a disposable test database in migration order', async () => {
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL is required for DB integration tests.');
    }

    requireSafeTestDatabaseUrl(testDatabaseUrl);

    const sql = postgres(testDatabaseUrl, {
      idle_timeout: 1,
      max: 1,
      prepare: false,
    });

    try {
      for (const { statement } of readMigrationStatements()) {
        await sql.unsafe(statement);
      }

      const tables = await sql<{ table_name: string }[]>`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
        order by table_name
      `;

      expect(tables.map((row) => row.table_name)).toEqual(
        expect.arrayContaining([
          'audit_logs',
          'businesses',
          'club_cards',
          'memberships',
          'profiles',
          'stripe_events',
          'users',
        ]),
      );
    } finally {
      await sql.end({ timeout: 1 });
    }
  }, 60_000);
});

import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import * as schema from '@/db/schema';

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

const runOrSkip = testDatabaseUrl ? describe : describe.skip;

runOrSkip('database transactions', () => {
  let sql: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL is required for DB integration tests.');
    }

    requireSafeTestDatabaseUrl(testDatabaseUrl);

    sql = postgres(testDatabaseUrl, {
      idle_timeout: 1,
      max: 1,
      prepare: false,
    });

    db = drizzle(sql, { schema });
  });

  afterAll(async () => {
    if (sql) {
      await sql.end({ timeout: 1 });
    }
  });

  it('rolls back transaction on error', async () => {
    const testUserId = randomUUID();
    const phone = `+1555${Date.now().toString().slice(-8)}`;

    await expect(
      sql.begin(async (tx) => {
        await tx`
          INSERT INTO users (id, phone, role, status, supabase_user_id)
          VALUES (${testUserId}, ${phone}, 'MEMBER', 'ACTIVE', ${`test:${testUserId}`})
        `;

        throw new Error('Simulated transaction failure');
      }),
    ).rejects.toThrow('Simulated transaction failure');

    const [found] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(found).toBeUndefined();
  });

  it('commits transaction on success', async () => {
    const testUserId = randomUUID();
    const phone = `+1555${Date.now().toString().slice(-8)}`;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO users (id, phone, role, status, supabase_user_id)
        VALUES (${testUserId}, ${phone}, 'MEMBER', 'ACTIVE', ${`test:${testUserId}`})
      `;

      await tx`
        INSERT INTO profiles (user_id) VALUES (${testUserId})
      `;
    });

    const [found] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(found).toBeDefined();

    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, testUserId))
      .limit(1);

    expect(profile).toBeDefined();

    await db.delete(schema.profiles).where(eq(schema.profiles.userId, testUserId));
    await db.delete(schema.users).where(eq(schema.users.id, testUserId));
  });

  it('handles nested savepoints with rollback', async () => {
    const testUserId = randomUUID();
    const phone = `+1555${Date.now().toString().slice(-8)}`;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO users (id, phone, role, status, supabase_user_id)
        VALUES (${testUserId}, ${phone}, 'MEMBER', 'ACTIVE', ${`test:${testUserId}`})
      `;

      try {
        await tx.savepoint(async (sp) => {
          await sp`
            INSERT INTO profiles (user_id) VALUES (${testUserId})
          `;

          throw new Error('Simulated savepoint failure');
        });
      } catch {
        // Savepoint rolled back, but outer transaction continues
      }

      await tx`
        UPDATE users SET display_name = 'Transaction Test' WHERE id = ${testUserId}
      `;
    });

    const [found] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(found).toBeDefined();
    expect(found?.displayName).toBe('Transaction Test');

    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, testUserId))
      .limit(1);

    expect(profile).toBeUndefined();

    await db.delete(schema.users).where(eq(schema.users.id, testUserId));
  });
});

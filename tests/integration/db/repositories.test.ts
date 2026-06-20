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

runOrSkip('database repositories', () => {
  let sql: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle>;
  const testUserId = randomUUID();

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
      await db.delete(schema.users).where(eq(schema.users.id, testUserId));
      await sql.end({ timeout: 1 });
    }
  });

  it('creates and retrieves a user record', async () => {
    const phone = `+1555${Date.now().toString().slice(-8)}`;

    const [inserted] = await db
      .insert(schema.users)
      .values({
        id: testUserId,
        displayName: 'Test User',
        phone,
        role: 'MEMBER',
        status: 'ACTIVE',
        supabaseUserId: `test:${testUserId}`,
      })
      .returning();

    expect(inserted).toBeDefined();
    expect(inserted?.id).toBe(testUserId);
    expect(inserted?.phone).toBe(phone);
    expect(inserted?.role).toBe('MEMBER');

    const [found] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(found).toBeDefined();
    expect(found?.id).toBe(testUserId);
  });

  it('updates user record with onConflictDoUpdate', async () => {
    const newDisplayName = 'Updated Test User';

    const [updated] = await db
      .insert(schema.users)
      .values({
        id: testUserId,
        displayName: newDisplayName,
        phone: `+1555${Date.now().toString().slice(-8)}`,
        role: 'MEMBER',
        status: 'ACTIVE',
        supabaseUserId: `test:${testUserId}`,
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: { displayName: newDisplayName, updatedAt: new Date() },
      })
      .returning();

    expect(updated?.displayName).toBe(newDisplayName);
  });

  it('creates profile for user', async () => {
    const [profile] = await db
      .insert(schema.profiles)
      .values({ userId: testUserId })
      .onConflictDoNothing()
      .returning();

    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(testUserId);
  });

  it('queries user with profile relation', async () => {
    const [userWithProfile] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(userWithProfile).toBeDefined();

    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, testUserId))
      .limit(1);

    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(testUserId);
  });
});

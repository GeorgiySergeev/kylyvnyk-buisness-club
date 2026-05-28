// scratch/apply-missing-migrations.ts
// Apply migrations 0003-0005 that were missed due to journal timestamp issues

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: '.env.local' });
config();

const url = process.env.DATABASE_URL_DIRECT?.trim();
if (!url) {
  console.error('DATABASE_URL_DIRECT is missing');
  process.exit(1);
}

const sql = postgres(url);

const MIGRATIONS = [
  '0003_add_vip_role.sql',
  '0004_business_discount_label.sql',
  '0005_admin_operational_modules.sql',
];

async function main() {
  for (const filename of MIGRATIONS) {
    const filePath = resolve('drizzle', filename);
    const content = readFileSync(filePath, 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = content
      .split('--\x3e statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`\nApplying ${filename} (${statements.length} statements)...`);

    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
        console.log(`  ✓ ${stmt.slice(0, 60).replace(/\n/g, ' ')}...`);
      } catch (e: unknown) {
        const pgErr = e as { code?: string; message?: string };
        // Ignore "already exists" errors for idempotency
        if (pgErr.code === '42710' || pgErr.code === '42P07' || pgErr.code === '42701') {
          console.log(`  ⚠ Already exists, skipping: ${pgErr.message}`);
        } else {
          console.error(`  ✗ Failed: ${pgErr.message}`);
          throw e;
        }
      }
    }

    // Register in drizzle journal table
    const tag = filename.replace('.sql', '');
    const now = Date.now();
    try {
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (tag, created_at)
        VALUES (${tag}, ${now})
        ON CONFLICT DO NOTHING
      `;
      console.log(`  ✓ Registered migration: ${tag}`);
    } catch (e: unknown) {
      console.log(`  ⚠ Could not register: ${(e as { message?: string }).message}`);
    }
  }

  // Verify
  const tables = await sql<{ table_name: string }[]>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('memberships', 'stripe_links', 'stripe_subscriptions', 'catalog_items')
    ORDER BY table_name
  `;
  console.log('\n✓ Verified tables:', tables.map((t) => t.table_name));

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


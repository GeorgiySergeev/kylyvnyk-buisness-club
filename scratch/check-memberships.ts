// scratch/check-memberships.ts
// Quick check if memberships table exists in the database

import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });
config();

const url = process.env.DATABASE_URL_DIRECT?.trim();
if (!url) {
  console.error('DATABASE_URL_DIRECT is missing');
  process.exit(1);
}

const sql = postgres(url);

async function main() {
  try {
    // Check if memberships table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('memberships', 'stripe_links', 'stripe_subscriptions', 'catalog_items')
      ORDER BY table_name
    `;
    console.log('Tables found:', tables.map((t: { table_name: string }) => t.table_name));

    // Check drizzle migration journal
    const migrations = await sql`
      SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at
    `;
    console.log('\nApplied migrations:');
    for (const m of migrations) {
      console.log(`  - ${m.tag} (${m.created_at})`);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}

main();

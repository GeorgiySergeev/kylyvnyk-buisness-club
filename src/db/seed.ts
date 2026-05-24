import { faker } from '@faker-js/faker';
import { config } from 'dotenv';

import {
  businesses,
  categories,
  cities,
  clubCards,
  countries,
  introductions,
  users,
} from './schema';

type SeedClient = typeof import('./seed-client');

let db: SeedClient['db'];
let sqlClient: SeedClient['sql'] | undefined;

config({ path: '.env.local' });
config();

faker.seed(42);

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const REQUIRED_SEED_CONFIRMATION = 'I_CONFIRM';

function assertSeedAllowed(): void {
  const errors: string[] = [];
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    errors.push('DATABASE_URL is missing.');
  } else {
    try {
      const parsedUrl = new URL(databaseUrl);

      if (!LOCAL_DATABASE_HOSTS.has(parsedUrl.hostname)) {
        errors.push(
          `DATABASE_URL host must be local (${Array.from(LOCAL_DATABASE_HOSTS).join(
            ', ',
          )}). Current host: ${parsedUrl.hostname}.`,
        );
      }
    } catch {
      errors.push('DATABASE_URL is not a valid URL.');
    }
  }

  if (process.env.ALLOW_SEED !== '1') {
    errors.push('ALLOW_SEED must be set to "1".');
  }

  if (process.env.CONFIRM_SEED !== REQUIRED_SEED_CONFIRMATION) {
    errors.push(`CONFIRM_SEED must be set to "${REQUIRED_SEED_CONFIRMATION}".`);
  }

  if (errors.length > 0) {
    console.error(
      [
        'Seed refused: destructive seed operations require an explicit local-only confirmation.',
        ...errors.map((error) => `- ${error}`),
      ].join('\n'),
    );
    process.exit(1);
  }
}

assertSeedAllowed();

const SEED_COUNTRIES = [
  { name: 'Ukraine', iso2: 'UA', flagEmoji: '🇺🇦' },
  { name: 'United States', iso2: 'US', flagEmoji: '🇺🇸' },
  { name: 'Germany', iso2: 'DE', flagEmoji: '🇩🇪' },
  { name: 'Poland', iso2: 'PL', flagEmoji: '🇵🇱' },
  { name: 'United Kingdom', iso2: 'GB', flagEmoji: '🇬🇧' },
  { name: 'France', iso2: 'FR', flagEmoji: '🇫🇷' },
  { name: 'Spain', iso2: 'ES', flagEmoji: '🇪🇸' },
  { name: 'Italy', iso2: 'IT', flagEmoji: '🇮🇹' },
  { name: 'Netherlands', iso2: 'NL', flagEmoji: '🇳🇱' },
  { name: 'Czech Republic', iso2: 'CZ', flagEmoji: '🇨🇿' },
  { name: 'Austria', iso2: 'AT', flagEmoji: '🇦🇹' },
  { name: 'Switzerland', iso2: 'CH', flagEmoji: '🇨🇭' },
  { name: 'Canada', iso2: 'CA', flagEmoji: '🇨🇦' },
  { name: 'Australia', iso2: 'AU', flagEmoji: '🇦🇺' },
  { name: 'Israel', iso2: 'IL', flagEmoji: '🇮🇱' },
] as const;

const SEED_CITIES: Record<string, readonly string[]> = {
  UA: ['Kyiv', 'Lviv', 'Odessa', 'Kharkiv', 'Dnipro'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  PL: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
  GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool'],
};

const SEED_CATEGORIES = [
  { name: 'Technology', slug: 'technology', icon: 'laptop' },
  { name: 'Finance & Banking', slug: 'finance', icon: 'landmark' },
  { name: 'Legal Services', slug: 'legal', icon: 'scale' },
  { name: 'Marketing & Advertising', slug: 'marketing', icon: 'megaphone' },
  { name: 'Real Estate', slug: 'real-estate', icon: 'building-2' },
  { name: 'Healthcare', slug: 'healthcare', icon: 'heart-pulse' },
  { name: 'Education & Training', slug: 'education', icon: 'graduation-cap' },
  { name: 'Logistics & Transport', slug: 'logistics', icon: 'truck' },
  { name: 'Food & Beverage', slug: 'food', icon: 'coffee' },
  { name: 'Consulting', slug: 'consulting', icon: 'briefcase' },
] as const;

const SEED_USERS = [
  {
    email: 'admin@kclub.dev',
    phone: '+15550000001',
    supabaseUserId: 'seed_admin_001',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
  },
  {
    email: 'business@kclub.dev',
    phone: '+15550000002',
    supabaseUserId: 'seed_business_001',
    role: 'BUSINESS' as const,
    status: 'ACTIVE' as const,
  },
  {
    email: 'member@kclub.dev',
    phone: '+15550000003',
    supabaseUserId: 'seed_member_001',
    role: 'FREE' as const,
    status: 'ACTIVE' as const,
  },
  {
    email: 'inactive@kclub.dev',
    phone: '+15550000004',
    supabaseUserId: 'seed_inactive_001',
    role: 'FREE' as const,
    status: 'INACTIVE' as const,
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function clearTables(): Promise<void> {
  console.log('Clearing tables...');
  await db.delete(clubCards);
  await db.delete(introductions);
  await db.delete(businesses);
  await db.delete(users);
  await db.delete(categories);
  await db.delete(cities);
  await db.delete(countries);
}

async function seed(): Promise<void> {
  await clearTables();

  console.log('Seeding countries... (15)');
  const insertedCountries = await db
    .insert(countries)
    .values([...SEED_COUNTRIES])
    .returning();

  const countryByIso = Object.fromEntries(insertedCountries.map((c) => [c.iso2, c]));

  console.log('Seeding cities... (25)');
  const cityRows = Object.entries(SEED_CITIES).flatMap(([iso2, names]) =>
    names.map((name) => ({
      name,
      countryId: countryByIso[iso2]!.id,
    })),
  );
  const insertedCities = await db.insert(cities).values(cityRows).returning();

  console.log('Seeding categories... (10)');
  const insertedCategories = await db
    .insert(categories)
    .values([...SEED_CATEGORIES])
    .returning();

  console.log('Seeding users... (4)');
  const insertedUsers = await db
    .insert(users)
    .values(
      SEED_USERS.map((u) => ({
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        supabaseUserId: u.supabaseUserId,
        displayName: u.email.split('@')[0],
      })),
    )
    .returning();

  const userByEmail = Object.fromEntries(insertedUsers.map((u) => [u.email, u]));
  const businessUser = userByEmail['business@kclub.dev']!;

  console.log('Seeding businesses... (8)');
  const businessStatuses = [
    'PUBLISHED',
    'PUBLISHED',
    'PUBLISHED',
    'PUBLISHED',
    'PUBLISHED',
    'PUBLISHED',
    'PENDING',
    'DRAFT',
  ] as const;

  const topPartnerFlags = [true, true, true, false, false, false, false, false];
  const recommendedFlags = [true, true, false, false, false, false, false, false];

  const businessRows = Array.from({ length: 8 }, (_, i) => {
    const name = faker.company.name();
    const category = faker.helpers.arrayElement(insertedCategories);
    const country = faker.helpers.arrayElement(insertedCountries);
    const cityInCountry = insertedCities.filter((c) => c.countryId === country.id);
    const city =
      cityInCountry.length > 0
        ? faker.helpers.arrayElement(cityInCountry)
        : faker.helpers.arrayElement(insertedCities);

    return {
      userId: businessUser.id,
      name,
      slug: `${slugify(name)}-${i + 1}`,
      description: `${faker.company.catchPhrase()} ${faker.lorem.sentences(2)}`,
      countryId: country.id,
      cityId: city.id,
      categoryId: category.id,
      status: businessStatuses[i]!,
      isTopPartner: topPartnerFlags[i]!,
      isRecommended: recommendedFlags[i]!,
    };
  });

  await db.insert(businesses).values(businessRows);

  console.log('Seeding cards... (3)');
  const expiresAt = new Date('2027-12-31T23:59:59.000Z');

  await db.insert(clubCards).values([
    {
      userId: userByEmail['business@kclub.dev']!.id,
      number: 'VIP-UA-SEED00001',
      memberType: 'VIP',
      status: 'ACTIVE',
      expiresAt,
    },
    {
      userId: userByEmail['member@kclub.dev']!.id,
      number: 'VIP-UA-SEED00002',
      memberType: 'FREE',
      status: 'ACTIVE',
      expiresAt,
    },
    {
      userId: userByEmail['admin@kclub.dev']!.id,
      number: 'BUS-UA-SEED00003',
      memberType: 'BUSINESS',
      status: 'ACTIVE',
      expiresAt,
    },
  ]);

  console.log('✓ Seed completed successfully');
}

async function main(): Promise<void> {
  try {
    const seedClient = await import('./seed-client');

    db = seedClient.db;
    sqlClient = seedClient.sql;

    await seed();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sqlClient?.end();
  }
}

void main();

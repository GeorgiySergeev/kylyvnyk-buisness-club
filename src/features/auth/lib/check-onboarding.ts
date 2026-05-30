import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { profiles } from '@/db/schema';

export async function isOnboardingComplete(userId: string) {
  const profile = await db.query.profiles.findFirst({
    columns: {
      countryId: true,
    },
    where: eq(profiles.userId, userId),
  });

  return profile?.countryId != null;
}

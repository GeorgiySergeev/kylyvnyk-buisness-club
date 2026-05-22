import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { db } from '@/db/client';
import { users } from '@/db/schema';
import { createAuditLog } from '@/lib/audit';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export const runtime = 'nodejs';

type ClerkEmailAddress = {
  email_address?: string;
  id?: string;
};

type ClerkUserPayload = {
  email_addresses?: ClerkEmailAddress[];
  first_name?: string | null;
  id: string;
  last_name?: string | null;
  primary_email_address_id?: string | null;
};

function getDisplayName(data: ClerkUserPayload) {
  const name = [data.first_name, data.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || null;
}

function getPrimaryEmail(data: ClerkUserPayload) {
  const primary = data.email_addresses?.find(
    (email) => email.id === data.primary_email_address_id,
  );

  return primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? null;
}

async function handleUserCreated(data: ClerkUserPayload) {
  const email = getPrimaryEmail(data);

  if (!email) {
    log.warn('Clerk user create skipped without primary email', {
      clerkUserId: data.id,
    });
    return;
  }

  const now = new Date();
  const rows = await db
    .insert(users)
    .values({
      clerkUserId: data.id,
      displayName: getDisplayName(data),
      email,
      role: 'FREE',
      status: 'ACTIVE',
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        deletedAt: null,
        displayName: getDisplayName(data),
        email,
        status: 'ACTIVE',
        updatedAt: now,
      },
      target: users.clerkUserId,
    })
    .returning({ id: users.id });

  await createAuditLog({
    action: 'USER_CREATE',
    entityId: rows[0]?.id ?? data.id,
    entityType: 'user',
    payload: {
      clerkUserId: data.id,
      email,
    },
  });
}

async function handleUserUpdated(data: ClerkUserPayload) {
  const email = getPrimaryEmail(data);

  if (!email) {
    log.warn('Clerk user update skipped without primary email', {
      clerkUserId: data.id,
    });
    return;
  }

  const rows = await db
    .update(users)
    .set({
      displayName: getDisplayName(data),
      email,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkUserId, data.id))
    .returning({ id: users.id });

  await createAuditLog({
    action: 'USER_UPDATE',
    entityId: rows[0]?.id ?? data.id,
    entityType: 'user',
    payload: {
      clerkUserId: data.id,
      email,
    },
  });
}

async function handleUserDeleted(data: Pick<ClerkUserPayload, 'id'>) {
  const rows = await db
    .update(users)
    .set({
      deletedAt: new Date(),
      status: 'INACTIVE',
      updatedAt: new Date(),
    })
    .where(eq(users.clerkUserId, data.id))
    .returning({ id: users.id });

  await createAuditLog({
    action: 'USER_DELETE',
    entityId: rows[0]?.id ?? data.id,
    entityType: 'user',
    payload: {
      clerkUserId: data.id,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    });

    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data as ClerkUserPayload);
        break;
      case 'user.updated':
        await handleUserUpdated(event.data as ClerkUserPayload);
        break;
      case 'user.deleted':
        await handleUserDeleted(event.data as Pick<ClerkUserPayload, 'id'>);
        break;
      default:
        log.info('Clerk webhook ignored unknown event', {
          eventType: event.type,
        });
    }

    return Response.json({ ok: true });
  } catch (error) {
    log.error('Clerk webhook verification or handling failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return Response.json({ error: 'Webhook verification failed' }, { status: 400 });
  }
}

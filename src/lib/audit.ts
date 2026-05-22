import 'server-only';

import { auditLogs } from '@/db/schema';
import { db } from '@/db/client';

type AuditPayload = Record<string, unknown>;

interface CreateAuditLogInput {
  action: string;
  actorUserId?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  ipAddress?: string | null;
  payload?: AuditPayload | null;
}

export async function createAuditLog({
  action,
  actorUserId = null,
  entityId = null,
  entityType = null,
  ipAddress = null,
  payload = null,
}: CreateAuditLogInput) {
  await db.insert(auditLogs).values({
    action,
    actorUserId,
    entityId,
    entityType,
    ipAddress,
    payload,
  });
}

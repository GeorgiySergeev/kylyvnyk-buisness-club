import { eq, or } from 'drizzle-orm';
import 'server-only';

import { db } from '@/db/client';
import { auditLogs, stripeSubscriptions } from '@/db/schema';
import { applySubscriptionState } from '@/features/billing/lib/membership-lifecycle';
import { resolvePlanCodeFromMetadata } from '@/features/billing/lib/membership-plan';
import { env } from '@/lib/env';
import { log } from '@/lib/log';
import { stripe } from '@/lib/stripe/config';

export interface ReconciliationResult {
  checked: number;
  errors: number;
  synced: number;
}

/**
 * Fetches all locally-tracked subscriptions that should be active, compares
 * them against Stripe's source of truth, and applies any state drift through
 * the standard `applySubscriptionState` pipeline.
 *
 * Designed to run as a daily Vercel Cron job (03:00 UTC) to catch missed or
 * out-of-order webhook deliveries.
 */
export async function reconcileStripeSubscriptions(): Promise<ReconciliationResult> {
  const trackedSubscriptions = await db.query.stripeSubscriptions.findMany({
    where: or(
      eq(stripeSubscriptions.status, 'active'),
      eq(stripeSubscriptions.status, 'past_due'),
      eq(stripeSubscriptions.status, 'trialing'),
      eq(stripeSubscriptions.status, 'unpaid'),
    ),
  });

  const result: ReconciliationResult = {
    checked: trackedSubscriptions.length,
    errors: 0,
    synced: 0,
  };

  for (const tracked of trackedSubscriptions) {
    try {
      const liveSubscription = await stripe.subscriptions.retrieve(tracked.stripeSubscriptionId);
      const userId = liveSubscription.metadata?.kclub_user_id ?? tracked.userId;

      if (!userId) {
        log.warn('stripe.reconciliation.no_user', {
          stripeSubscriptionId: tracked.stripeSubscriptionId,
        });
        continue;
      }

      const planCode = resolvePlanCodeFromMetadata(
        liveSubscription.metadata,
        liveSubscription.items.data[0]?.price.id ?? null,
        env.STRIPE_PRICE_VIP_ANNUAL,
        env.STRIPE_PRICE_BUSINESS_ANNUAL,
      );

      await applySubscriptionState({
        planCode,
        stripeEventId: `reconciliation:${tracked.stripeSubscriptionId}`,
        subscription: liveSubscription,
        userId,
      });

      result.synced++;
    } catch (error) {
      result.errors++;
      log.error('stripe.reconciliation.subscription_failed', {
        message: error instanceof Error ? error.message : 'unknown',
        stripeSubscriptionId: tracked.stripeSubscriptionId,
      });
    }
  }

  await db.insert(auditLogs).values({
    action: 'STRIPE_RECONCILIATION_COMPLETE',
    entityType: 'system',
    payload: result,
  });

  log.info('stripe.reconciliation.complete', {
    checked: result.checked,
    errors: result.errors,
    synced: result.synced,
  });

  return result;
}

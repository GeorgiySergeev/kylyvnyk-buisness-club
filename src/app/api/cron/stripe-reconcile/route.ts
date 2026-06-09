import 'server-only';

import { NextResponse } from 'next/server';

import { reconcileStripeSubscriptions } from '@/features/billing/lib/stripe-reconciliation';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret) {
    log.error('cron.stripe_reconcile.misconfigured');
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const authorization = request.headers.get('authorization');

  if (authorization !== `Bearer ${cronSecret}`) {
    log.warn('cron.stripe_reconcile.unauthorized');
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await reconcileStripeSubscriptions();

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    log.error('cron.stripe_reconcile.failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });

    return NextResponse.json(
      { error: 'Reconciliation failed.' },
      { status: 500 },
    );
  }
}

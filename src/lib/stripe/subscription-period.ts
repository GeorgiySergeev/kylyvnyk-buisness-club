import type Stripe from 'stripe';

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  if (!subscription.current_period_end) {
    return null;
  }

  return new Date(subscription.current_period_end * 1000);
}

export function getSubscriptionPeriodStart(subscription: Stripe.Subscription): Date | null {
  if (!subscription.current_period_start) {
    return null;
  }

  return new Date(subscription.current_period_start * 1000);
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'ACTIVE';
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'EXPIRED';
    default:
      return 'EXPIRED';
  }
}

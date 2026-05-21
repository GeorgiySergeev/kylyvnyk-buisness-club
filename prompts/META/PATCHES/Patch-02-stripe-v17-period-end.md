### Snippet — extracting subscription period (Stripe API ≥ 2024-12-x)

```ts
// src/lib/stripe/period.ts
import 'server-only';
import type Stripe from 'stripe';

/**
 * In Stripe API 2024-12-* and later, current_period_{start,end} were removed
 * from the Subscription root and moved onto each SubscriptionItem.
 * We use the first item's window (all items on one sub share it for our setup).
 */
export function getSubscriptionPeriod(s: Stripe.Subscription) {
  const item = s.items.data[0];
  if (!item?.current_period_end || !item?.current_period_start) {
    throw new Error(`Stripe subscription ${s.id} has no item period — check apiVersion pin`);
  }
  return {
    currentPeriodStart: new Date(item.current_period_start * 1000),
    currentPeriodEnd: new Date(item.current_period_end * 1000),
  };
}
```

```ts
// src/lib/stripe/config.ts  — PIN THE API VERSION
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // bump only via an ADR
  typescript: true,
});
```

### Acceptance

- Unit test: feeds a fake `Subscription` with `items.data[0].current_period_end`
  set; asserts the returned `Date` is correct.
- Unit test: feeds a `Subscription` with empty items; asserts the function
  throws with a message containing `apiVersion`.

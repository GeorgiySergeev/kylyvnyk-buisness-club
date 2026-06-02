import 'server-only';

import type Stripe from 'stripe';

import type { SupportedLocale } from '@/components/layout/navigation';
import type {
  BillingTranslationResolver,
  MemberBillingInvoice,
  MemberBillingPaymentMethod,
} from '@/features/billing/lib/member-billing-mappers';
import {
  mapBillingStatusLabel,
  mapInvoice,
  mapPaymentMethod,
} from '@/features/billing/lib/member-billing-mappers';
import { VIP_PLAN_CODE } from '@/features/billing/lib/plan-codes';
import { getT } from '@/lib/i18n/t-server';
import { stripe } from '@/lib/stripe/config';
import { getSubscriptionPeriodEnd } from '@/lib/stripe/subscription-period';

export interface MemberBillingSnapshot {
  autoPayEnabled: boolean;
  currentPeriodEndLabel: string | null;
  defaultPaymentMethodId: string | null;
  invoices: MemberBillingInvoice[];
  paymentMethods: MemberBillingPaymentMethod[];
  planCode: string;
  status: string;
  statusLabel: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

interface GetMemberBillingSnapshotInput {
  currentPeriodEnd: Date | null;
  locale: SupportedLocale;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

function formatDate(value: Date | number | null, locale: SupportedLocale) {
  if (!value) {
    return null;
  }

  const resolvedDate = typeof value === 'number' ? new Date(value * 1000) : value;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(resolvedDate);
}

function resolveDefaultPaymentMethodId(input: {
  customer: Stripe.Customer | Stripe.DeletedCustomer;
  subscription: Stripe.Subscription;
}) {
  const subscriptionDefault =
    typeof input.subscription.default_payment_method === 'string'
      ? input.subscription.default_payment_method
      : input.subscription.default_payment_method?.id ?? null;

  if (subscriptionDefault) {
    return subscriptionDefault;
  }

  if (input.customer.deleted) {
    return null;
  }

  const customerDefault = input.customer.invoice_settings.default_payment_method;
  return typeof customerDefault === 'string' ? customerDefault : customerDefault?.id ?? null;
}

export async function getMemberBillingSnapshot(
  input: GetMemberBillingSnapshotInput,
): Promise<MemberBillingSnapshot | null> {
  const t = getT('dashboard', input.locale);
  const translate: BillingTranslationResolver = (key) => t(key as never);
  const [customer, subscription, invoices, paymentMethods] = await Promise.all([
    stripe.customers.retrieve(input.stripeCustomerId, {
      expand: ['invoice_settings.default_payment_method'],
    }),
    stripe.subscriptions.retrieve(input.stripeSubscriptionId, {
      expand: ['default_payment_method'],
    }),
    stripe.invoices.list({
      customer: input.stripeCustomerId,
      limit: 8,
      subscription: input.stripeSubscriptionId,
    }),
    stripe.paymentMethods.list({
      customer: input.stripeCustomerId,
      limit: 8,
      type: 'card',
    }),
  ]);

  if (customer.deleted) {
    return null;
  }

  const defaultPaymentMethodId = resolveDefaultPaymentMethodId({
    customer,
    subscription,
  });

  return {
    autoPayEnabled: !subscription.cancel_at_period_end,
    currentPeriodEndLabel: formatDate(
      getSubscriptionPeriodEnd(subscription) ?? input.currentPeriodEnd,
      input.locale,
    ),
    defaultPaymentMethodId,
    invoices: invoices.data.map((invoice) =>
      mapInvoice({
        invoice,
        locale: input.locale,
        t: translate,
      }),
    ),
    paymentMethods: paymentMethods.data
      .map((paymentMethod) =>
        mapPaymentMethod({
          defaultPaymentMethodId,
          paymentMethod,
        }),
      )
      .filter((paymentMethod): paymentMethod is MemberBillingPaymentMethod => Boolean(paymentMethod)),
    planCode: VIP_PLAN_CODE,
    status: subscription.status,
    statusLabel: mapBillingStatusLabel(subscription.status, translate),
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
  };
}

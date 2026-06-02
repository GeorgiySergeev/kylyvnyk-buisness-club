import type Stripe from 'stripe';

export interface BillingTranslationResolver {
  (key: string): string;
}

export interface MemberBillingPaymentMethod {
  brand: string;
  expMonth: number;
  expYear: number;
  id: string;
  isDefault: boolean;
  label: string;
  last4: string;
}

export interface MemberBillingInvoice {
  amountLabel: string;
  createdAtLabel: string;
  currency: string;
  hostedInvoiceUrl: string | null;
  id: string;
  invoicePdfUrl: string | null;
  number: string | null;
  status: string;
  statusLabel: string;
}

function formatCurrencyAmount(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    currency: currency.toUpperCase(),
    style: 'currency',
  }).format(amountMinor / 100);
}

function formatDate(value: Date | number | null, locale: string) {
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

function formatCardLabel(card: Stripe.PaymentMethod.Card) {
  const brand = `${card.brand.slice(0, 1).toUpperCase()}${card.brand.slice(1)}`;
  return `${brand} ending in ${card.last4}`;
}

export function mapBillingStatusLabel(status: string, t: BillingTranslationResolver) {
  switch (status) {
    case 'active':
      return t('subscriptionStatusActive');
    case 'canceled':
      return t('subscriptionStatusCanceled');
    case 'incomplete':
      return t('subscriptionStatusIncomplete');
    case 'incomplete_expired':
      return t('subscriptionStatusIncompleteExpired');
    case 'past_due':
      return t('subscriptionStatusPastDue');
    case 'trialing':
      return t('subscriptionStatusTrialing');
    case 'unpaid':
      return t('subscriptionStatusUnpaid');
    default:
      return t('subscriptionStatusUnknown');
  }
}

export function mapInvoiceStatusLabel(
  status: Stripe.Invoice.Status | null,
  t: BillingTranslationResolver,
) {
  switch (status) {
    case 'draft':
      return t('subscriptionInvoiceDraft');
    case 'open':
      return t('subscriptionInvoiceOpen');
    case 'paid':
      return t('subscriptionInvoicePaid');
    case 'uncollectible':
      return t('subscriptionInvoiceUncollectible');
    case 'void':
      return t('subscriptionInvoiceVoided');
    default:
      return t('subscriptionStatusUnknown');
  }
}

export function mapPaymentMethod(input: {
  defaultPaymentMethodId: string | null;
  paymentMethod: Stripe.PaymentMethod;
}): MemberBillingPaymentMethod | null {
  if (input.paymentMethod.type !== 'card' || !input.paymentMethod.card) {
    return null;
  }

  return {
    brand: input.paymentMethod.card.brand,
    expMonth: input.paymentMethod.card.exp_month,
    expYear: input.paymentMethod.card.exp_year,
    id: input.paymentMethod.id,
    isDefault: input.paymentMethod.id === input.defaultPaymentMethodId,
    label: formatCardLabel(input.paymentMethod.card),
    last4: input.paymentMethod.card.last4,
  };
}

export function mapInvoice(input: {
  invoice: Stripe.Invoice;
  locale: string;
  t: BillingTranslationResolver;
}): MemberBillingInvoice {
  return {
    amountLabel: formatCurrencyAmount(input.invoice.amount_paid, input.invoice.currency, input.locale),
    createdAtLabel: formatDate(input.invoice.created, input.locale) ?? input.t('subscriptionStatusUnknown'),
    currency: input.invoice.currency,
    hostedInvoiceUrl: input.invoice.hosted_invoice_url ?? null,
    id: input.invoice.id,
    invoicePdfUrl: input.invoice.invoice_pdf ?? null,
    number: input.invoice.number,
    status: input.invoice.status ?? 'unknown',
    statusLabel: mapInvoiceStatusLabel(input.invoice.status, input.t),
  };
}

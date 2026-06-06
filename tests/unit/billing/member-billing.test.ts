import assert from 'node:assert/strict';
import { test } from 'vitest';

import type Stripe from 'stripe';

import {
  mapBillingStatusLabel,
  mapInvoice,
  mapPaymentMethod,
} from '../../../src/features/billing/lib/member-billing-mappers';

const t = (key: string) => key;

test('mapBillingStatusLabel maps known Stripe subscription statuses', () => {
  assert.equal(mapBillingStatusLabel('active', t), 'subscriptionStatusActive');
  assert.equal(mapBillingStatusLabel('past_due', t), 'subscriptionStatusPastDue');
  assert.equal(mapBillingStatusLabel('something_else', t), 'subscriptionStatusUnknown');
});

test('mapPaymentMethod marks the default saved card', () => {
  const paymentMethod = {
    card: {
      brand: 'visa',
      exp_month: 12,
      exp_year: 2030,
      last4: '4242',
    },
    id: 'pm_123',
    type: 'card',
  } as Stripe.PaymentMethod;

  const mapped = mapPaymentMethod({
    defaultPaymentMethodId: 'pm_123',
    paymentMethod,
  });

  assert.equal(mapped?.isDefault, true);
  assert.equal(mapped?.label, 'Visa ending in 4242');
});

test('mapInvoice builds a safe invoice DTO', () => {
  const invoice = {
    amount_paid: 19900,
    created: 1760000000,
    currency: 'usd',
    hosted_invoice_url: 'https://example.com/invoice',
    id: 'in_123',
    invoice_pdf: 'https://example.com/invoice.pdf',
    number: 'INV-123',
    status: 'paid',
  } as Stripe.Invoice;

  const mapped = mapInvoice({
    invoice,
    locale: 'en',
    t,
  });

  assert.equal(mapped.amountLabel, '$199.00');
  assert.equal(mapped.statusLabel, 'subscriptionInvoicePaid');
  assert.equal(mapped.hostedInvoiceUrl, 'https://example.com/invoice');
});

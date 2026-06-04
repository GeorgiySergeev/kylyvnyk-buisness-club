'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import {
  DashboardSettingsRow,
  DashboardTabPanel,
} from '@/components/member/dashboard-ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { BillingPortalButton } from '@/features/billing/components/billing-portal-button';
import { CancelVipButton } from '@/features/billing/components/cancel-vip-button';
import type { MemberBillingSnapshot } from '@/features/billing/lib/member-billing';

import {
  createBillingSetupIntentAction,
  finalizeBillingPaymentMethodAction,
  setDefaultPaymentMethodAction,
  setSubscriptionAutoPayAction,
} from '../actions/billing.action';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export interface MemberSubscriptionTabLabels {
  addCard: string;
  addCardDescription: string;
  addCardError: string;
  addCardPending: string;
  addCardSubmit: string;
  autoPayDescription: string;
  autoPayOff: string;
  autoPayOn: string;
  autoPayTitle: string;
  billingPortalDescription: string;
  billingPortalError: string;
  billingPortalPending: string;
  billingPortalTitle: string;
  cancelVipCta: string;
  cancelVipDescription: string;
  cancelVipError: string;
  cancelVipPending: string;
  cancelVipScheduled: string;
  cancelVipTitle: string;
  currentPaymentMethod: string;
  noPaymentMethods: string;
  noSubscriptionData: string;
  noTransactions: string;
  paymentMethodsDescription: string;
  paymentMethodsTitle: string;
  periodEnd: string;
  saveDefaultCard: string;
  saveDefaultCardPending: string;
  selectDefaultCard: string;
  status: string;
  subscriptionStatusDescription: string;
  subscriptionStatusTitle: string;
  transactionsDescription: string;
  transactionsUnavailable: string;
  transactionsTitle: string;
  viewInvoice: string;
}

interface MemberSubscriptionTabProps {
  hasBillingPortal: boolean;
  isVip: boolean;
  labels: MemberSubscriptionTabLabels;
  locale: SupportedLocale;
  snapshot: MemberBillingSnapshot | null;
  vipSubscription: {
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
  } | null;
}

interface AddPaymentMethodFormProps {
  errorMessage: string | null;
  labels: MemberSubscriptionTabLabels;
  locale: SupportedLocale;
  onSuccess: () => void;
}

function AddPaymentMethodForm({
  errorMessage,
  labels,
  locale,
  onSuccess,
}: AddPaymentMethodFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [formError, setFormError] = useState<string | null>(errorMessage);
  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    if (!stripe || !elements) {
      setFormError(labels.addCardError);
      return;
    }

    setFormError(null);

    const result = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setFormError(result.error.message ?? labels.addCardError);
      return;
    }

    const paymentMethodId =
      typeof result.setupIntent.payment_method === 'string'
        ? result.setupIntent.payment_method
        : result.setupIntent.payment_method?.id;

    if (!paymentMethodId) {
      setFormError(labels.addCardError);
      return;
    }

    startTransition(async () => {
      const finalize = await finalizeBillingPaymentMethodAction(locale, {
        paymentMethodId,
      });

      if (!finalize.ok) {
        setFormError(finalize.error.message ?? labels.addCardError);
        return;
      }

      onSuccess();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-ds-radius-md border border-ds-border bg-ds-surface p-ds-space-4">
        <PaymentElement />
      </div>
      {formError ? (
        <p role="alert" className="text-ds-text-sm text-ds-error">
          {formError}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="button"
          className="min-h-11 rounded-ds-radius-md"
          disabled={pending}
          onClick={handleSubmit}
        >
          {pending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
          {pending ? labels.addCardPending : labels.addCardSubmit}
        </Button>
      </div>
    </div>
  );
}

export function MemberSubscriptionTab({
  hasBillingPortal,
  isVip,
  labels,
  locale,
  snapshot,
  vipSubscription,
}: MemberSubscriptionTabProps) {
  const router = useRouter();
  const [autoPayPending, startAutoPayTransition] = useTransition();
  const [defaultPending, startDefaultTransition] = useTransition();
  const [setupPending, startSetupTransition] = useTransition();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(
    snapshot?.defaultPaymentMethodId ?? null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const elementsOptions = useMemo(
    () => ({
      appearance: {
        theme: 'night' as const,
      },
      clientSecret: setupClientSecret ?? '',
    }),
    [setupClientSecret],
  );

  const periodEndLabel = vipSubscription?.currentPeriodEnd
    ? `${labels.periodEnd}: ${new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(vipSubscription.currentPeriodEnd)}`
    : snapshot?.currentPeriodEndLabel
      ? `${labels.periodEnd}: ${snapshot.currentPeriodEndLabel}`
      : null;

  function closeDialog() {
    setDialogOpen(false);
    setSetupClientSecret(null);
    setSetupError(null);
  }

  function openAddCardDialog() {
    setDialogOpen(true);
    setSetupClientSecret(null);
    setSetupError(null);
    startSetupTransition(async () => {
      const result = await createBillingSetupIntentAction(locale);

      if (!result.ok) {
        setSetupError(result.error.message ?? labels.addCardError);
        return;
      }

      setSetupClientSecret(result.data.clientSecret);
    });
  }

  function updateAutoPay(enabled: boolean) {
    setActionError(null);
    startAutoPayTransition(async () => {
      const result = await setSubscriptionAutoPayAction(locale, { enabled });

      if (!result.ok) {
        setActionError(result.error.message);
        return;
      }

      router.refresh();
    });
  }

  function saveDefaultPaymentMethod() {
    if (!selectedPaymentMethodId) {
      return;
    }

    setActionError(null);
    startDefaultTransition(async () => {
      const result = await setDefaultPaymentMethodAction(locale, {
        paymentMethodId: selectedPaymentMethodId,
      });

      if (!result.ok) {
        setActionError(result.error.message);
        return;
      }

      router.refresh();
    });
  }

  if (!isVip) {
    return (
      <DashboardTabPanel
        embedded
        description={labels.subscriptionStatusDescription}
        title={labels.subscriptionStatusTitle}
      >
        <EmptyState
          description={labels.noSubscriptionData}
          title={labels.subscriptionStatusTitle}
        />
      </DashboardTabPanel>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardTabPanel
        embedded
        description={labels.subscriptionStatusDescription}
        title={labels.subscriptionStatusTitle}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-ds-radius-md border border-ds-border bg-ds-surface p-ds-space-5">
            <p className="text-ds-text-sm text-ds-text-muted">{labels.status}</p>
            <p className="mt-2 text-ds-text-base font-semibold text-ds-text">
              {snapshot?.statusLabel ?? labels.noSubscriptionData}
            </p>
          </div>
          <div className="rounded-ds-radius-md border border-ds-border bg-ds-surface p-ds-space-5">
            <p className="text-ds-text-sm text-ds-text-muted">{labels.periodEnd}</p>
            <p className="mt-2 text-ds-text-base font-semibold text-ds-text">
              {snapshot?.currentPeriodEndLabel ?? periodEndLabel ?? labels.noSubscriptionData}
            </p>
          </div>
        </div>
        <CancelVipButton
          cancelAtPeriodEnd={vipSubscription?.cancelAtPeriodEnd ?? false}
          labels={{
            cta: labels.cancelVipCta,
            description: labels.cancelVipDescription,
            error: labels.cancelVipError,
            pending: labels.cancelVipPending,
            scheduled: labels.cancelVipScheduled,
            title: labels.cancelVipTitle,
          }}
          locale={locale}
          periodEndLabel={periodEndLabel}
        />
      </DashboardTabPanel>

      <DashboardTabPanel
        embedded
        description={labels.autoPayDescription}
        title={labels.autoPayTitle}
      >
        <DashboardSettingsRow
          description={labels.autoPayDescription}
          title={labels.autoPayTitle}
          action={
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-hover"
              disabled={autoPayPending}
              onClick={() => updateAutoPay(!(snapshot?.autoPayEnabled ?? false))}
            >
              {autoPayPending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
              {snapshot?.autoPayEnabled ? labels.autoPayOn : labels.autoPayOff}
            </Button>
          }
        />
        {actionError ? (
          <p role="alert" className="text-ds-text-sm text-ds-error">
            {actionError}
          </p>
        ) : null}
      </DashboardTabPanel>

      <DashboardTabPanel
        embedded
        description={labels.paymentMethodsDescription}
        title={labels.paymentMethodsTitle}
      >
        {snapshot?.paymentMethods.length ? (
          <div className="space-y-4">
            <p className="text-ds-text-sm text-ds-text-muted">{labels.selectDefaultCard}</p>
            <div className="space-y-3">
              {snapshot.paymentMethods.map((paymentMethod) => (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-ds-radius-md border border-ds-border bg-ds-surface px-ds-space-4 py-ds-space-4"
                  key={paymentMethod.id}
                >
                  <input
                    checked={selectedPaymentMethodId === paymentMethod.id}
                    className="size-4"
                    name="defaultPaymentMethod"
                    type="radio"
                    value={paymentMethod.id}
                    onChange={() => setSelectedPaymentMethodId(paymentMethod.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ds-text-sm font-semibold text-ds-text">{paymentMethod.label}</p>
                    <p className="mt-1 text-ds-text-sm text-ds-text-muted">
                      {paymentMethod.expMonth}/{paymentMethod.expYear}
                      {paymentMethod.isDefault ? ` · ${labels.currentPaymentMethod}` : ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-hover"
                disabled={
                  defaultPending ||
                  !selectedPaymentMethodId ||
                  selectedPaymentMethodId === snapshot.defaultPaymentMethodId
                }
                onClick={saveDefaultPaymentMethod}
              >
                {defaultPending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
                {defaultPending ? labels.saveDefaultCardPending : labels.saveDefaultCard}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-hover"
                disabled={setupPending || stripePromise === null}
                onClick={openAddCardDialog}
              >
                {setupPending ? (
                  <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                ) : (
                  <CreditCard aria-hidden="true" className="mr-2 size-4" />
                )}
                {labels.addCard}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              description={labels.noPaymentMethods}
              title={labels.paymentMethodsTitle}
              action={{
                label: labels.addCard,
                onClick: openAddCardDialog,
              }}
            />
          </div>
        )}
      </DashboardTabPanel>

      <DashboardTabPanel
        embedded
        description={labels.transactionsDescription}
        title={labels.transactionsTitle}
      >
        {snapshot?.invoices.length ? (
          <div className="space-y-3">
            {snapshot.invoices.map((invoice) => (
              <div
                className="flex flex-col gap-3 rounded-ds-radius-md border border-ds-border bg-ds-surface px-ds-space-4 py-ds-space-4 sm:flex-row sm:items-center sm:justify-between"
                key={invoice.id}
              >
                <div className="min-w-0">
                  <p className="text-ds-text-sm font-semibold text-ds-text">
                    {invoice.number ?? invoice.id}
                  </p>
                  <p className="mt-1 text-ds-text-sm text-ds-text-muted">
                    {invoice.createdAtLabel} · {invoice.amountLabel} · {invoice.statusLabel}
                  </p>
                </div>
                {invoice.hostedInvoiceUrl || invoice.invoicePdfUrl ? (
                  <a
                    className="inline-flex min-h-11 items-center gap-2 text-ds-text-sm font-semibold text-ds-text transition-colors hover:text-ds-text-muted"
                    href={invoice.hostedInvoiceUrl ?? invoice.invoicePdfUrl ?? '#'}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ReceiptText aria-hidden="true" className="size-4" />
                    {labels.viewInvoice}
                  </a>
                ) : (
                  <span className="text-ds-text-sm text-ds-text-muted">
                    {labels.transactionsUnavailable}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            description={labels.noTransactions}
            title={labels.transactionsTitle}
            icon={<ReceiptText className="size-6" />}
          />
        )}
      </DashboardTabPanel>

      {hasBillingPortal ? (
        <DashboardTabPanel
          embedded
          description={labels.billingPortalDescription}
          title={labels.billingPortalTitle}
        >
          <BillingPortalButton
            errorLabel={labels.billingPortalError}
            labels={{
              cta: labels.billingPortalTitle,
              pending: labels.billingPortalPending,
            }}
            locale={locale}
          />
        </DashboardTabPanel>
      ) : null}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            return;
          }

          setDialogOpen(true);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{labels.addCard}</DialogTitle>
            <DialogDescription>{labels.addCardDescription}</DialogDescription>
          </DialogHeader>
          {setupClientSecret && stripePromise ? (
            <Elements options={elementsOptions} stripe={stripePromise}>
              <AddPaymentMethodForm
                errorMessage={setupError}
                labels={labels}
                locale={locale}
                onSuccess={closeDialog}
              />
            </Elements>
          ) : (
            <div className="flex min-h-24 items-center justify-center">
              {setupPending ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin text-ds-text-muted" />
              ) : (
                <p className="text-ds-text-sm text-ds-error">{setupError ?? labels.addCardError}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  startTotpEnrollmentAction,
  verifyTotpEnrollmentAction,
} from '../actions/mfa.action';

interface TotpMfaLabels {
  challengeDescription: string;
  challengeTitle: string;
  codeHelp: string;
  codeLabel: string;
  loading: string;
  qrAlt: string;
  secretLabel: string;
  setupDescription: string;
  setupTitle: string;
  submit: string;
  submitting: string;
}

interface TotpMfaFormProps {
  initialFactorId?: string;
  labels: TotpMfaLabels;
  locale: SupportedLocale;
  mode: 'challenge' | 'enroll';
}

export function TotpMfaForm({ initialFactorId, labels, locale, mode }: TotpMfaFormProps) {
  const router = useRouter();
  const [factorId, setFactorId] = useState(initialFactorId ?? '');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(mode === 'enroll');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (mode !== 'enroll') {
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      setError(null);
      setLoadingSetup(true);

      const result = await startTotpEnrollmentAction(locale);

      if (cancelled) {
        return;
      }

      setLoadingSetup(false);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setFactorId(result.data.factorId);
      setQrCode(result.data.qrCode);
      setSecret(result.data.secret);
    });

    return () => {
      cancelled = true;
    };
  }, [locale, mode]);

  function verifyCode() {
    setError(null);
    startTransition(async () => {
      const result = await verifyTotpEnrollmentAction(locale, {
        code,
        factorId,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      router.push(result.data.redirectTo);
      router.refresh();
    });
  }

  const disabled = pending || loadingSetup || !factorId;
  const title = mode === 'challenge' ? labels.challengeTitle : labels.setupTitle;
  const description =
    mode === 'challenge' ? labels.challengeDescription : labels.setupDescription;

  return (
    <form
      className="w-full max-w-xl space-y-ds-space-6 rounded-ds-radius-lg border border-ds-border bg-ds-surface p-ds-space-6 sm:p-ds-space-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        verifyCode();
      }}
    >
      <div className="space-y-2">
        <h2 className="text-ds-text-lg font-semibold text-ds-text">{title}</h2>
        <p className="text-ds-text-sm leading-6 text-ds-text-muted">{description}</p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-ds-radius-md border border-ds-error/40 bg-ds-error/10 px-ds-space-4 py-ds-space-3 text-ds-text-sm text-ds-error"
        >
          {error}
        </p>
      ) : null}

      {mode === 'enroll' ? (
        <div className="space-y-4">
          {loadingSetup ? (
            <div className="flex min-h-44 items-center justify-center rounded-ds-radius-md border border-ds-border bg-ds-surface-2 text-ds-text-sm text-ds-text-muted">
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              {labels.loading}
            </div>
          ) : null}

          {qrCode ? (
            <div className="flex flex-col items-center gap-4 rounded-ds-radius-md border border-ds-border bg-white p-ds-space-4 text-black">
              {/* Supabase returns an SVG/data URL QR code that should be rendered as-is. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="size-44" src={qrCode} alt={labels.qrAlt} />
              {secret ? (
                <div className="w-full rounded-ds-radius-md border border-black/10 bg-black/5 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/60">
                    {labels.secretLabel}
                  </p>
                  <p className="break-all font-mono text-sm text-black">{secret}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="totpCode" className="text-ds-text-sm font-medium text-ds-text">
          {labels.codeLabel}
        </label>
        <Input
          id="totpCode"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          minLength={6}
          pattern="[0-9]{6}"
          disabled={disabled}
          aria-describedby="totpCode-help"
          className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-center font-mono text-ds-text tracking-widest"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <p id="totpCode-help" className="text-ds-text-sm leading-6 text-ds-text-muted">
          {labels.codeHelp}
        </p>
      </div>

      <Button
        type="submit"
        disabled={disabled || code.length !== 6}
        className="min-h-11 w-full rounded-ds-radius-md border border-ds-border bg-ds-surface-hover text-ds-text hover:bg-ds-surface-hover-2"
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}

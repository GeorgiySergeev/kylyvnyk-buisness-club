'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  devBypassPhoneAuthAction,
  requestPhoneOtpAction,
  verifyPhoneOtpAction,
} from '../actions/phone-auth.action';
import { getAuthErrorLink } from '../lib/phone-auth-intent';
import { TurnstileWidget } from './turnstile-widget';

// Mirrors PHONE_PATTERN from /features/auth/lib/phone.ts — kept here to
// avoid pulling server-only modules into a Client Component bundle.
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const prefixed = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
  return prefixed.replace(/[^\d+]/g, '');
}

interface PhoneAuthLabels {
  accountExists: string;
  accountNotFound: string;
  code: string;
  codeHelp: string;
  devBypass: string;
  phone: string;
  phoneHelp: string;
  phoneInvalid: string;
  phonePlaceholder: string;
  requestCode: string;
  submitting: string;
  verifyCode: string;
}

interface PhoneAuthFormProps {
  devBypassEnabled: boolean;
  intent: 'sign-in' | 'sign-up';
  labels: PhoneAuthLabels;
  locale: SupportedLocale;
  returnBackUrl?: string;
}

type Step = 'phone' | 'code';

export function PhoneAuthForm({
  devBypassEnabled,
  intent,
  labels,
  locale,
  returnBackUrl,
}: PhoneAuthFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>('phone');
  // phoneInput — controlled value of the phone <Input> (what the user types).
  // sentPhone  — normalised phone returned by the server after OTP dispatch;
  //              intentionally separate so it never overwrites the input value
  //              and can never silently bypass client-side validation.
  const [phoneInput, setPhoneInput] = useState('');
  const [sentPhone, setSentPhone] = useState('');
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorLink, setErrorLink] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function finish(redirectTo: string) {
    router.push(redirectTo);
    router.refresh();
  }

  function getFormValue(name: string) {
    const value = formRef.current
      ? new FormData(formRef.current).get(name)
      : null;

    return typeof value === 'string' ? value : '';
  }

  function resetTurnstile() {
    setCaptchaToken('');
    setTurnstileKey((current) => current + 1);
  }

  function validatePhone(rawPhone: string): boolean {
    const normalized = normalizePhone(rawPhone);
    if (!PHONE_PATTERN.test(normalized)) {
      setPhoneError(labels.phoneInvalid);
      return false;
    }
    setPhoneError(null);
    return true;
  }

  function requestCode(rawPhone = getFormValue('phone')) {
    setError(null);
    setErrorLink(null);
    if (!validatePhone(rawPhone)) return;
    const phone = normalizePhone(rawPhone);
    startTransition(async () => {
      try {
        const result = await requestPhoneOtpAction(locale, intent, {
          phone,
          captchaToken,
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
          if (
            result.error.code === 'ACCOUNT_NOT_FOUND' ||
            result.error.code === 'ACCOUNT_ALREADY_EXISTS'
          ) {
            setErrorLink(getAuthErrorLink(result.error.code));
          }
          return;
        }

        // Store the server-normalised phone in a dedicated state so it never
        // overwrites the input value and cannot bypass validation on re-submit.
        setSentPhone(result.data.phone);
        setStep('code');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      } finally {
        if (!devBypassEnabled) {
          resetTurnstile();
        }
      }
    });
  }

  function verifyCode(rawCode = getFormValue('code')) {
    setError(null);
    setErrorLink(null);
    startTransition(async () => {
      try {
        const result = await verifyPhoneOtpAction(locale, intent, {
          code: rawCode,
          phone: sentPhone,
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
          if (
            result.error.code === 'ACCOUNT_NOT_FOUND' ||
            result.error.code === 'ACCOUNT_ALREADY_EXISTS'
          ) {
            setErrorLink(getAuthErrorLink(result.error.code));
          }
          return;
        }

        finish(result.data.redirectTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      }
    });
  }

  function devBypass(rawPhone = getFormValue('phone')) {
    setError(null);
    setErrorLink(null);
    if (!validatePhone(rawPhone)) return;
    const phone = normalizePhone(rawPhone);
    startTransition(async () => {
      try {
        const result = await devBypassPhoneAuthAction(locale, intent, {
          phone,
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
          if (
            result.error.code === 'ACCOUNT_NOT_FOUND' ||
            result.error.code === 'ACCOUNT_ALREADY_EXISTS'
          ) {
            setErrorLink(getAuthErrorLink(result.error.code));
          }
          return;
        }

        finish(result.data.redirectTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      }
    });
  }

  return (
    <form
      className="w-full max-w-md space-y-ds-space-6 rounded-ds-radius-lg border border-ds-border bg-ds-surface p-ds-space-6 sm:p-ds-space-8"
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 'phone') {
          requestCode();
          return;
        }
        verifyCode();
      }}
    >
      {error ? (
        <div
          role="alert"
          className="rounded-ds-radius-md border border-ds-error/40 bg-ds-error/10 px-ds-space-4 py-ds-space-3 text-ds-text-sm text-ds-error"
        >
          <p>{error}</p>
          {errorLink ? (
            <p className="mt-2">
              <Link className="underline underline-offset-2" href={`/${locale}${errorLink}`}>
                {errorLink === '/sign-up' ? labels.accountNotFound : labels.accountExists}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-ds-text-sm font-medium text-ds-text">
              {labels.phone}
            </label>
            <Input
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              aria-describedby={phoneError ? 'phone-error' : 'phone-help'}
              aria-invalid={phoneError ? true : undefined}
              className={`min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text${
                phoneError ? ' border-ds-error focus-visible:ring-ds-error/50' : ''
              }`}
              disabled={pending}
              value={phoneInput}
              onChange={(event) => {
                setPhoneInput(event.target.value);
                if (phoneError) setPhoneError(null);
              }}
              placeholder={labels.phonePlaceholder}
            />
            {phoneError ? (
              <p
                id="phone-error"
                role="alert"
                className="text-ds-text-sm text-ds-error"
              >
                {phoneError}
              </p>
            ) : (
              <p id="phone-help" className="text-ds-text-sm leading-6 text-ds-text-muted">
                {labels.phoneHelp}
              </p>
            )}
            {!devBypassEnabled && (
              <TurnstileWidget key={turnstileKey} onVerify={setCaptchaToken} />
            )}
          </div>
        </>
      ) : null}

      {step === 'code' ? (
        <div className="space-y-2">
          <label htmlFor="code" className="text-ds-text-sm font-medium text-ds-text">
            {labels.code}
          </label>
          <Input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            aria-describedby="code-help"
            className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text"
            disabled={pending}
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <p id="code-help" className="text-ds-text-sm leading-6 text-ds-text-muted">
            {labels.codeHelp}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={pending}
          className="min-h-11 flex-1 rounded-ds-radius-md border border-ds-border bg-ds-surface-hover text-ds-text hover:bg-ds-surface-hover-2"
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {pending ? labels.submitting : step === 'phone' ? labels.requestCode : labels.verifyCode}
        </Button>
        {devBypassEnabled && step === 'phone' ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="min-h-11 flex-1 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-hover"
            onClick={() => devBypass()}
          >
            {labels.devBypass}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

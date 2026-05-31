'use client';

import { Loader2 } from 'lucide-react';
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
import { TurnstileWidget } from './turnstile-widget';

interface PhoneAuthLabels {
  code: string;
  codeHelp: string;
  devBypass: string;
  name: string;
  nameHelp: string;
  namePlaceholder: string;
  phone: string;
  phoneHelp: string;
  phonePlaceholder: string;
  requestCode: string;
  submitting: string;
  verifyCode: string;
}

interface PhoneAuthFormProps {
  devBypassEnabled: boolean;
  labels: PhoneAuthLabels;
  locale: SupportedLocale;
  returnBackUrl?: string;
}

type Step = 'phone' | 'code';

export function PhoneAuthForm({ devBypassEnabled, labels, locale, returnBackUrl }: PhoneAuthFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>('phone');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState<string | null>(null);
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

  function requestCode(rawPhone = getFormValue('phone')) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await requestPhoneOtpAction(locale, {
          phone: rawPhone,
          captchaToken,
          displayName: displayName.trim(),
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
          return;
        }

        if (result.data.devBypass) {
          finish(result.data.redirectTo);
          return;
        }

        setPhone(result.data.phone);
        setStep('code');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      }
    });
  }

  function verifyCode(rawCode = getFormValue('code')) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await verifyPhoneOtpAction(locale, {
          code: rawCode,
          phone,
          displayName: displayName.trim(),
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
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
    startTransition(async () => {
      try {
        const result = await devBypassPhoneAuthAction(locale, {
          phone: rawPhone,
          displayName: displayName.trim(),
          returnBackUrl,
        });

        if (!result.ok) {
          setError(result.error.message);
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
        <p
          role="alert"
          className="rounded-ds-radius-md border border-ds-error/40 bg-ds-error/10 px-ds-space-4 py-ds-space-3 text-ds-text-sm text-ds-error"
        >
          {error}
        </p>
      ) : null}

      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-ds-text-sm font-medium text-ds-text">
              {labels.name}
            </label>
            <Input
              id="displayName"
              name="displayName"
              autoComplete="name"
              aria-describedby="displayName-help"
              className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text"
              disabled={pending}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={labels.namePlaceholder}
            />
            <p id="displayName-help" className="text-ds-text-sm leading-6 text-ds-text-muted">
              {labels.nameHelp}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-ds-text-sm font-medium text-ds-text">
              {labels.phone}
            </label>
            <Input
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              aria-describedby="phone-help"
              className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text"
              disabled={pending}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={labels.phonePlaceholder}
            />
            <p id="phone-help" className="text-ds-text-sm leading-6 text-ds-text-muted">
              {labels.phoneHelp}
            </p>
            {!devBypassEnabled && <TurnstileWidget onVerify={setCaptchaToken} />}
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

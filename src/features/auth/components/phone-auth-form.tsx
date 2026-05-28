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
}

type Step = 'phone' | 'code';

export function PhoneAuthForm({ devBypassEnabled, labels, locale }: PhoneAuthFormProps) {
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
      const result = await requestPhoneOtpAction(locale, { phone: rawPhone, captchaToken });

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
    });
  }

  function verifyCode(rawCode = getFormValue('code')) {
    setError(null);
    startTransition(async () => {
      const result = await verifyPhoneOtpAction(locale, {
        code: rawCode,
        phone,
        displayName: displayName.trim(),
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      finish(result.data.redirectTo);
    });
  }

  function devBypass(rawPhone = getFormValue('phone')) {
    setError(null);
    startTransition(async () => {
      const result = await devBypassPhoneAuthAction(locale, { phone: rawPhone });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      finish(result.data.redirectTo);
    });
  }

  return (
    <form
      className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8"
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
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-semibold text-foreground">
              {labels.name}
            </label>
            <Input
              id="displayName"
              name="displayName"
              autoComplete="name"
              aria-describedby="displayName-help"
              className="min-h-11"
              disabled={pending}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={labels.namePlaceholder}
            />
            <p id="displayName-help" className="text-sm leading-6 text-muted-foreground">
              {labels.nameHelp}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              {labels.phone}
            </label>
            <Input
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              aria-describedby="phone-help"
              className="min-h-11"
              disabled={pending}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={labels.phonePlaceholder}
            />
            <p id="phone-help" className="text-sm leading-6 text-muted-foreground">
              {labels.phoneHelp}
            </p>
            {!devBypassEnabled && <TurnstileWidget onVerify={setCaptchaToken} />}
          </div>
        </>
      ) : null}

      {step === 'code' ? (
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-semibold text-foreground">
            {labels.code}
          </label>
          <Input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            aria-describedby="code-help"
            className="min-h-11"
            disabled={pending}
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <p id="code-help" className="text-sm leading-6 text-muted-foreground">
            {labels.codeHelp}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending} className="min-h-11 flex-1">
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {pending ? labels.submitting : step === 'phone' ? labels.requestCode : labels.verifyCode}
        </Button>
        {devBypassEnabled && step === 'phone' ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="min-h-11 flex-1"
            onClick={() => devBypass()}
          >
            {labels.devBypass}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

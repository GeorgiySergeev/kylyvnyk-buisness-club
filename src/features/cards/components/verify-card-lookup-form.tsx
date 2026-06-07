'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CARD_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{2,63}$/;

interface VerifyCardLookupFormProps {
  buttonLabel: string;
  emptyError: string;
  helpText: string;
  inputLabel: string;
  inputPlaceholder: string;
  invalidError: string;
  locale: SupportedLocale;
}

function normalizeCardNumber(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

export function VerifyCardLookupForm({
  buttonLabel,
  emptyError,
  helpText,
  inputLabel,
  inputPlaceholder,
  invalidError,
  locale,
}: VerifyCardLookupFormProps) {
  const helpId = useId();
  const errorId = useId();
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = normalizeCardNumber(cardNumber);
    if (!normalized) {
      setError(emptyError);
      return;
    }

    if (!CARD_NUMBER_PATTERN.test(normalized)) {
      setError(invalidError);
      return;
    }

    setError(null);
    window.location.assign(localizeHref(locale, `/verify-card/${encodeURIComponent(normalized)}`));
  }

  return (
    <form className="space-y-ds-space-5" noValidate onSubmit={submit}>
      <div className="space-y-2">
        <label htmlFor="card-number" className="text-ds-text-sm font-medium text-ds-text">
          {inputLabel}
        </label>
        <Input
          id="card-number"
          name="cardNumber"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={error ? errorId : helpId}
          aria-invalid={error ? true : undefined}
          className="min-h-11 rounded-ds-radius-md border-ds-border bg-transparent font-mono text-ds-text tracking-wider uppercase"
          value={cardNumber}
          onChange={(event) => {
            setCardNumber(event.target.value);
            if (error) setError(null);
          }}
          placeholder={inputPlaceholder}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-ds-text-sm text-ds-error">
            {error}
          </p>
        ) : (
          <p id={helpId} className="text-ds-text-sm leading-6 text-ds-text-muted">
            {helpText}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="min-h-11 rounded-ds-radius-md border border-ds-border bg-ds-surface-hover text-ds-text hover:bg-ds-surface-hover-2"
      >
        <Search aria-hidden="true" />
        {buttonLabel}
      </Button>
    </form>
  );
}

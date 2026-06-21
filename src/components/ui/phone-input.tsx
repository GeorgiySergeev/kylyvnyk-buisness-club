'use client';

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CountryPhoneSelect } from '@/components/ui/country-phone-select';
import { detectBrowserCountry } from '@/lib/geo/browser-country';
import {
  DEFAULT_PHONE_COUNTRY,
  type PhoneCountry,
  getCountryByDialPrefix,
  getCountryByIso2,
} from '@/lib/phone/countries';
import { deriveIso2FromPhone } from '@/lib/phone/derive-iso2-from-phone';
import { cn } from '@/lib/utils';

function ensurePlusPrefix(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) return trimmed.replace(/[^\d+]/g, '');
  if (trimmed.startsWith('00')) return `+${trimmed.slice(2).replace(/\D/g, '')}`;
  return `+${trimmed.replace(/\D/g, '')}`;
}

function replaceDialPrefix(value: string, nextDialCode: string): string {
  const normalized = ensurePlusPrefix(value);
  const digits = normalized.replace(/^\+/, '');
  const current = getCountryByDialPrefix(digits);
  const national = current ? digits.slice(current.dialCode.length) : digits;
  return `+${nextDialCode}${national}`;
}

export interface PhoneInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value'
> {
  countrySearchPlaceholder: string;
  countrySelectLabel: string;
  defaultCountry?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

function resolveInitialCountry(fallbackIso2: string): PhoneCountry {
  if (typeof window !== 'undefined') {
    const detected = detectBrowserCountry();
    if (detected) {
      const country = getCountryByIso2(detected);
      if (country) return country;
    }
  }
  return getCountryByIso2(fallbackIso2) ?? DEFAULT_PHONE_COUNTRY;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    className,
    countrySearchPlaceholder,
    countrySelectLabel,
    defaultCountry = 'ua',
    disabled,
    onChange,
    value = '',
    ...props
  },
  ref,
) {
  const didInitRef = useRef(false);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(() => {
    return resolveInitialCountry(defaultCountry);
  });

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initialCountry = resolveInitialCountry(defaultCountry);
    setSelectedCountry(initialCountry);

    if (!value && initialCountry.dialCode) {
      const initial = `+${initialCountry.dialCode}`;
      onChange?.({
        target: { value: initial },
      } as ChangeEvent<HTMLInputElement>);
    }
  }, [defaultCountry, onChange, value]);

  useEffect(() => {
    const iso2 = deriveIso2FromPhone(value);
    if (!iso2) return;

    const detected = getCountryByIso2(iso2);
    if (detected && detected.iso2 !== selectedCountry.iso2) {
      setSelectedCountry(detected);
    }
  }, [value, selectedCountry.iso2]);

  function handleCountryChange(country: PhoneCountry) {
    setSelectedCountry(country);
    const nextValue = replaceDialPrefix(value, country.dialCode);
    onChange?.({
      target: { value: nextValue },
    } as ChangeEvent<HTMLInputElement>);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = ensurePlusPrefix(event.target.value);
    onChange?.({
      ...event,
      target: { ...event.target, value: nextValue },
    });
  }

  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-ds-radius-md border border-ds-border bg-transparent shadow-sm transition-colors focus-within:border-ds-accent focus-within:ring-[3px] focus-within:ring-ds-accent-subtle has-disabled:opacity-50',
        props['aria-invalid'] ? 'border-ds-error focus-within:ring-ds-error/50' : '',
        className,
      )}
    >
      <CountryPhoneSelect
        disabled={disabled}
        searchPlaceholder={countrySearchPlaceholder}
        triggerLabel={countrySelectLabel}
        value={selectedCountry}
        onChange={handleCountryChange}
      />
      <input
        ref={ref}
        autoComplete="tel"
        data-slot="input"
        disabled={disabled}
        inputMode="tel"
        type="tel"
        value={value}
        className={cn(
          'min-h-11 flex-1 rounded-r-ds-radius-md border-0 bg-transparent px-3 py-1.5 text-ds-text-sm text-ds-text outline-none placeholder:text-ds-text-muted disabled:cursor-not-allowed',
        )}
        onChange={handleInputChange}
        {...props}
      />
    </div>
  );
});

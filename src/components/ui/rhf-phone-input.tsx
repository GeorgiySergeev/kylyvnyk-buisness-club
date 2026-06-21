'use client';

import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { PhoneInput, type PhoneInputProps } from '@/components/ui/phone-input';

export const DEFAULT_PHONE_INPUT_LABELS = {
  countrySearchPlaceholder: 'Search country...',
  countrySelectLabel: 'Country code',
} as const;

type RhfPhoneInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  countrySearchPlaceholder: string;
  countrySelectLabel: string;
  defaultCountry?: string;
} & Omit<
  PhoneInputProps,
  'value' | 'onChange' | 'countrySearchPlaceholder' | 'countrySelectLabel' | 'defaultCountry'
>;

export function RhfPhoneInput<T extends FieldValues>({
  control,
  name,
  countrySearchPlaceholder,
  countrySelectLabel,
  defaultCountry = 'ua',
  ...inputProps
}: RhfPhoneInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <PhoneInput
          {...inputProps}
          countrySearchPlaceholder={countrySearchPlaceholder}
          countrySelectLabel={countrySelectLabel}
          defaultCountry={defaultCountry}
          name={field.name}
          ref={field.ref}
          value={typeof field.value === 'string' ? field.value : ''}
          onBlur={field.onBlur}
          onChange={field.onChange}
        />
      )}
    />
  );
}

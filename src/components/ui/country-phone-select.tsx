'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ClientCountryFlag } from '@/components/ui/client-country-flag';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { PhoneCountry } from '@/lib/phone/countries';
import { PHONE_COUNTRIES } from '@/lib/phone/countries';
import { cn } from '@/lib/utils';

export interface CountryPhoneSelectProps {
  className?: string;
  disabled?: boolean;
  emptyLabel?: string;
  onChange: (country: PhoneCountry) => void;
  searchPlaceholder: string;
  triggerLabel: string;
  value: PhoneCountry;
}

export function CountryPhoneSelect({
  className,
  disabled = false,
  emptyLabel = 'No country found.',
  onChange,
  searchPlaceholder,
  triggerLabel,
  value,
}: CountryPhoneSelectProps) {
  const [open, setOpen] = useState(false);

  const searchKeywords = useMemo(
    () =>
      PHONE_COUNTRIES.map((country) => ({
        ...country,
        keywords: `${country.name} +${country.dialCode} ${country.dialCode} ${country.iso2}`,
      })),
    [],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={triggerLabel}
        className={cn(
          'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-l-ds-radius-md border border-ds-border bg-ds-surface px-2 transition-colors outline-none focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        disabled={disabled}
        type="button"
      >
        <ClientCountryFlag iso2={value.iso2} />
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-ds-text-muted" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {searchKeywords.map((country) => (
                <CommandItem
                  key={country.iso2}
                  keywords={[country.keywords]}
                  value={country.keywords}
                  onSelect={() => {
                    onChange(country);
                    setOpen(false);
                  }}
                >
                  <ClientCountryFlag iso2={country.iso2} />
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="shrink-0 text-ds-text-muted">+{country.dialCode}</span>
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      country.iso2 === value.iso2 ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import 'server-only';

import { resolveCountryFlagSvg } from '@/lib/flags/resolve-country-flag-svg';
import { cn } from '@/lib/utils';

export interface CountryFlagProps {
  className?: string;
  iso2: string;
}

export async function CountryFlag({ className, iso2 }: CountryFlagProps) {
  const svgMarkup = await resolveCountryFlagSvg(iso2);
  if (!svgMarkup) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-3 w-[1.125rem] shrink-0 overflow-hidden rounded-sm [&_svg]:size-full',
        className,
      )}
      // Static flag sprites from src/assets; ISO2 is validated in resolveCountryFlagSvg.
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

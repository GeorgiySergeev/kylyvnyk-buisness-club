import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { cn } from '@/lib/utils';

export interface CountryFlagProps {
  className?: string;
  iso2: string;
}

const FLAGS_DIR = path.join(process.cwd(), 'src', 'assets', 'flags.svg');

function normalizeCountryCode(iso2: string): string | null {
  const code = iso2.trim().toLowerCase();
  return /^[a-z]{2}(?:-[a-z]{2})?$/.test(code) ? code : null;
}

export async function CountryFlag({ className, iso2 }: CountryFlagProps) {
  const code = normalizeCountryCode(iso2);
  if (!code) return null;

  try {
    const svgMarkup = await readFile(path.join(FLAGS_DIR, `${code}.svg`), 'utf8');

    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-3 w-[1.125rem] shrink-0 overflow-hidden rounded-sm [&_svg]:size-full',
          className,
        )}
        // Static flag sprites from src/assets; ISO2 is validated above.
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  } catch {
    return null;
  }
}

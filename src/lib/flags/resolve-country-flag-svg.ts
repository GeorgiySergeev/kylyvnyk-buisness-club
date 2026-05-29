import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FLAGS_DIR = path.join(process.cwd(), 'src', 'assets', 'flags.svg');

function normalizeCountryCode(iso2: string): string | null {
  const code = iso2.trim().toLowerCase();
  return /^[a-z]{2}(?:-[a-z]{2})?$/.test(code) ? code : null;
}

export async function resolveCountryFlagSvg(iso2?: string | null): Promise<string | null> {
  if (!iso2) return null;

  const code = normalizeCountryCode(iso2);
  if (!code) return null;

  try {
    return await readFile(path.join(FLAGS_DIR, `${code}.svg`), 'utf8');
  } catch {
    return null;
  }
}

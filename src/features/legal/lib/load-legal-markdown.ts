import 'server-only';

import fs from 'fs/promises';
import path from 'path';

import type { SupportedLocale } from '@/components/layout/navigation';

import { markdownToHtml } from './markdown-to-html';

export type LegalMarkdownDocument = 'cookie' | 'privacy';

const LEGAL_MARKDOWN_FILENAMES: Record<LegalMarkdownDocument, string> = {
  privacy: 'legal.policy.md',
  cookie: 'legal.cookie.md',
};

export async function loadLegalMarkdownHtml(
  document: LegalMarkdownDocument,
  locale: SupportedLocale,
): Promise<string | null> {
  const filename = LEGAL_MARKDOWN_FILENAMES[document];
  const markdownPath = path.join(process.cwd(), 'messages', locale, filename);

  try {
    const markdown = await fs.readFile(markdownPath, 'utf8');
    return markdownToHtml(markdown);
  } catch {
    return null;
  }
}

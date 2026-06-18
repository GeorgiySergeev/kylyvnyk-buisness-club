import { describe, expect, it } from 'vitest';

import { markdownToHtml } from '@/features/legal/lib/markdown-to-html';

describe('markdownToHtml', () => {
  it('renders numbered sections, paragraphs, and bullet lists', () => {
    const markdown = `1. ОБЩИЕ ПОЛОЖЕНИЯ

Первый абзац.

Второй абзац.

⸻

2. ОПЕРАТОР ДАННЫХ

Список:

• первый пункт;

• второй пункт;`;

    const html = markdownToHtml(markdown);

    expect(html).toContain('<h2>ОБЩИЕ ПОЛОЖЕНИЯ</h2>');
    expect(html).toContain('<p>Первый абзац.</p>');
    expect(html).toContain('<p>Второй абзац.</p>');
    expect(html).toContain('<h2>ОПЕРАТОР ДАННЫХ</h2>');
    expect(html).toContain('<li>первый пункт;</li>');
    expect(html).toContain('<li>второй пункт;</li>');
  });

  it('renders cookie preamble metadata before numbered sections', () => {
    const markdown = `COOKIE POLICY

KYLYVNYK CLUB

Effective Date: July 1, 2026

⸻

1. ОБЩИЕ ПОЛОЖЕНИЯ

Текст раздела.`;

    const html = markdownToHtml(markdown);

    expect(html).toContain('legal-md-preamble');
    expect(html).toContain('<h2 class="legal-md-doc-title">COOKIE POLICY</h2>');
    expect(html).toContain('Effective Date: July 1, 2026');
    expect(html).toContain('<h2>ОБЩИЕ ПОЛОЖЕНИЯ</h2>');
  });
});

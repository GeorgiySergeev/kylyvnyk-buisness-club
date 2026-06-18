function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isSectionHeading(line: string): boolean {
  return /^\d+\.\s+\S/.test(line);
}

function isBulletLine(line: string): boolean {
  return line.startsWith('•');
}

function renderLines(lines: string[]): string {
  let html = '';
  let paragraphBuffer: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    html += `<p>${escapeHtml(paragraphBuffer.join(' '))}</p>`;
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    html += `<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    listItems = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? '';

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (index === 0 && isSectionHeading(line)) {
      flushParagraph();
      flushList();
      html += `<h2>${escapeHtml(line.replace(/^\d+\.\s+/, ''))}</h2>`;
      continue;
    }

    if (isBulletLine(line)) {
      flushParagraph();
      listItems.push(line.replace(/^•\s*/, ''));
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return html;
}

function renderPreamble(lines: string[]): string {
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);

  if (nonEmptyLines.length === 0) {
    return '';
  }

  const [title, ...metaLines] = nonEmptyLines;

  return [
    '<header class="legal-md-preamble">',
    `<h2 class="legal-md-doc-title">${escapeHtml(title ?? '')}</h2>`,
    metaLines.length > 0
      ? `<div class="legal-md-meta">${metaLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>`
      : '',
    '</header>',
  ].join('');
}

export function markdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  const chunks = normalized.split(/\n⸻\n|\n---\n/);
  const sections: string[] = [];

  for (const chunk of chunks) {
    const trimmedChunk = chunk.trim();

    if (!trimmedChunk) {
      continue;
    }

    const lines = trimmedChunk.split('\n');
    const firstNonEmptyLine = lines.map((line) => line.trim()).find(Boolean) ?? '';
    const html = isSectionHeading(firstNonEmptyLine)
      ? renderLines(lines)
      : renderPreamble(lines);

    if (html) {
      sections.push(`<section class="legal-md-section">${html}</section>`);
    }
  }

  return `<div class="legal-markdown">${sections.join('')}</div>`;
}

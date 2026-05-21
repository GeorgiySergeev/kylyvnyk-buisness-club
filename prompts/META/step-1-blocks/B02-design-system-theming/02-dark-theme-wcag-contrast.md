# 02. Dark Theme & WCAG Contrast

## Objective

Guarantee accessible contrast (WCAG 2.1 AA) for text and iconography on dark surfaces with gold accents.

## Steps

1. Add a development-only tokens preview page to visually validate contrast.
2. Define safe text/background pairings with reusable utility classes.
3. Document “do/don’t” color combinations alongside acceptance criteria for WCAG AA.

## Files to Add

- `src/app/(public)/tokens/page.tsx`
- `src/styles/a11y-notes.md` (optional developer notes)

### `src/app/(public)/tokens/page.tsx`

```tsx
'use client';

export default function TokensPreview() {
  const Cell = ({ title, className }: { title: string; className: string }) => (
    <div className="rounded-md p-4 border border-border shadow-soft">
      <div className={`h-16 rounded ${className}`} />
      <p className="mt-3 text-sm text-fgMuted">{title}</p>
    </div>
  );

  const Swatch = ({
    bg,
    text = 'text-fg',
    label,
  }: {
    bg: string;
    text?: string;
    label: string;
  }) => (
    <div className={`rounded-md p-4 ${bg}`}>
      <p className={`text-sm ${text}`}>{label}</p>
      <p className={`mt-1 text-base font-medium ${text}`}>The quick brown fox</p>
      <button className={`mt-3 px-4 py-2 rounded-md ${text} border border-border focus-gold`}>
        Button
      </button>
    </div>
  );

  return (
    <main className="container space-y-8 py-8">
      <h1 className="text-2xl font-semibold">Tokens & Contrast Preview</h1>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Cell title="bg" className="bg-bg" />
        <Cell title="bgElev" className="bg-bgElev" />
        <Cell title="card" className="bg-card" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Swatch bg="bg-bg" label="Text fg on bg" />
        <Swatch bg="bg-card" label="Text fg on card" />
        <Swatch bg="bg-bg gold-gradient" text="text-fgOnGold" label="Text on gold gradient" />
        <Swatch bg="bg-bg" text="text-gold-400" label="Gold text on bg (muted accent)" />
      </section>

      <section>
        <p className="text-sm text-fgMuted">
          Rules: Body text uses text-fg on dark surfaces (bg/card). Gold text is accent-only—avoid
          long paragraphs. Buttons and links need clear focus styles (`focus-gold`).
        </p>
      </section>
    </main>
  );
}
```

## Accessibility Rules

- **Body text:** `text-fg` on `bg`/`card` surfaces — contrast ≥ 12:1 (passes AA/AAA).
- **Gold usage:** `text-gold-400`/`text-gold` on `bg-bg` only for short labels or icons; avoid long paragraphs.
- **Gold backgrounds:** Use `text-fgOnGold` on gold gradients to ensure contrast.
- **Buttons:** Default `text-fg` on dark surfaces with `focus-gold` focus styles; never use gold text on gold backgrounds.
- **Links:** Apply `underline-offset-2` and `decoration-gold` on hover.
- **Touch targets:** Maintain a minimum interactive area of 44×44px.

## Acceptance Criteria

- Preview page renders token swatches without readability issues.
- No gold text appears on gold backgrounds.
- Small text (<18pt) meets AA contrast; large text (≥18pt or 14pt bold) meets AA.

# 06. Icons Setup (Lucide & Custom)

## Objective

Install Lucide icons and create a simple wrapper for consistent sizing and coloring. Add a pathway for custom brand SVGs without extra loaders.

## Steps

1. Install `lucide-react`.
2. Create an `Icon` wrapper that maps names to Lucide icons.
3. Add a folder for custom SVG React components (hand-authored TSX).
4. Provide usage examples in the UI.

## Command

```bash
pnpm add lucide-react
```

## Files to Add

- `src/components/icons/icon.tsx`
- `src/components/icons/brand/kylyvnyk-logo.tsx`
- `src/components/icons/README.md`

### `src/components/icons/icon.tsx`

```tsx
import * as Lucide from 'lucide-react';

type IconName = keyof typeof Lucide;

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = Lucide[name] as any;
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} />;
}
```

### `src/components/icons/brand/kylyvnyk-logo.tsx`

```tsx
export function KylyvnykLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-label="KYLYVNYK CLUB" className={className} role="img">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(46, 85%, 42%)" />
          <stop offset="50%" stopColor="hsl(46, 85%, 55%)" />
          <stop offset="100%" stopColor="hsl(46, 82%, 60%)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#goldGrad)" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fill="hsl(0, 0%, 8%)"
      >
        KC
      </text>
    </svg>
  );
}
```

### `src/components/icons/README.md`

```md
# Icons

- Use `Icon` for Lucide icons: `<Icon name="Globe2" size={24} className="text-gold" />`.
- Brand/custom icons live in `brand/` as TSX components (no external loaders).
- Keep stroke/icon colors semantic via Tailwind (e.g., `text-gold`, `text-fgMuted`).
```

## Acceptance Criteria

- Lucide icons render via `<Icon name="..." />`.
- Custom brand logo component compiles and uses the gold gradient.
- No custom webpack loaders are required; everything remains TSX-based.

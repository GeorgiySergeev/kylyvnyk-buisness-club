06-icons-setup.md
Title
Icons Setup — Lucide and custom SVGs

Objective
Install Lucide icons and create a simple wrapper for consistent size/color. Add a pathway for custom brand SVGs without extra loaders.

Steps
Install lucide-react.
Create an Icon wrapper that maps names to Lucide icons.
Add a folder for custom SVG React components (hand-authored TSX).
Provide usage examples in UI.
Commands
bash

copy
pnpm add lucide-react
Files to add
src/components/icons/icon.tsx
src/components/icons/brand/kylyvnyk-logo.tsx (placeholder)
src/components/icons/README.md
src/components/icons/icon.tsx
tsx

copy
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
src/components/icons/brand/kylyvnyk-logo.tsx
tsx

copy
export function KylyvnykLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-label="KYLYVNYK CLUB"
      className={className}
      role="img"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(46,85%,42%)" />
          <stop offset="50%" stopColor="hsl(46,85%,55%)" />
          <stop offset="100%" stopColor="hsl(46,82%,60%)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#goldGrad)" />
      <text x="50%" y="54%" textAnchor="middle" fontSize="18" fontWeight="800" fill="hsl(0,0%,8%)">
        KC
      </text>
    </svg>
  );
}
src/components/icons/README.md
md

copy
# Icons

- Use `Icon` for Lucide icons: `<Icon name="Globe2" size={24} className="text-gold" />`
- Brand/custom icons live in `brand/` as TSX components (no external loaders).
- Keep stroke/icon colors semantic via Tailwind (e.g., `text-gold`, `text-fgMuted`).
Acceptance
Lucide icons render via <Icon name="..."/>.
Custom brand logo component compiles and uses gold gradient.
No custom webpack loaders required; everything TSX-based.
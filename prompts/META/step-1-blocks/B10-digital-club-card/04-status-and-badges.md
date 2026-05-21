# 04-status-and-badges.md

## Title

Digital Card — type and status badges

## Objective

Provide clear, accessible badges for member type and card status. Derive “EXPIRED” when expiresAt < now.

## Steps

1. Create TypeBadge (FREE/VIP styles).
2. Create StatusBadge (ACTIVE/EXPIRED/INACTIVE styles; accepts expiresAt to derive).
3. Reuse on member and verify pages.

## Files to add

- src/features/membership/type-badge.tsx
- src/features/membership/status-badges.tsx

### src/features/membership/type-badge.tsx

```tsx
export function TypeBadge({ type }: { type: 'FREE' | 'VIP' }) {
  if (type === 'VIP') {
    return (
      <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-gold-800/30 text-gold-400 border border-gold-700/50">
        VIP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-bgElev text-fg border border-border">
      FREE
    </span>
  );
}
```

### src/features/membership/status-badges.tsx

```tsx
function derive(exp: Date | null, raw: 'ACTIVE' | 'INACTIVE' | 'EXPIRED') {
  if (raw === 'INACTIVE') return 'INACTIVE' as const;
  if (exp && new Date(exp).getTime() < Date.now()) return 'EXPIRED' as const;
  if (raw === 'EXPIRED') return 'EXPIRED' as const;
  return 'ACTIVE' as const;
}

export function StatusBadge({
  status,
  expiresAt,
}: {
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiresAt: Date | null;
}) {
  const d = derive(expiresAt, status);
  if (d === 'ACTIVE') {
    return (
      <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-600/50">
        ACTIVE
      </span>
    );
  }
  if (d === 'EXPIRED') {
    return (
      <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-600/50">
        EXPIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-neutral-600/20 text-neutral-300 border border-neutral-600/50">
      INACTIVE
    </span>
  );
}
```

## Acceptance

- VIP badge uses gold accents; FREE is neutral.
- Status badge shows EXPIRED when past expiresAt.
- Badges are readable on dark backgrounds.

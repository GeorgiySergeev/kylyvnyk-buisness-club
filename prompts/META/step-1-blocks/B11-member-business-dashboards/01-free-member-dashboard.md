# 01-free-member-dashboard.md

## Title

FREE Member Dashboard — card, catalog access, special conditions, upgrade to VIP

## Objective

Create the member home that:

- Ensures a digital card exists for the user.
- Shows the card panel.
- Promotes Catalog (special conditions are visible after sign‑in).
- Provides clear upgrade to VIP CTA.

## Steps

1) Ensure a card exists on first visit (server).
2) Render MemberCardPanel (from B10 S02).
3) Add actions row: Browse Catalog + Upgrade to VIP.
4) Small note about private conditions and legal phrasing.

## Files to add/modify

- src/app/(member)/page.tsx
- src/features/membership/server/ensure-on-visit.ts (tiny wrapper)

### src/features/membership/server/ensure-on-visit.ts

```ts
import 'server-only';
import { ensureMemberCard } from '@/features/membership/server/cards';
import { getCurrentUserWithRole } from '@/features/auth/server/roles';

export async function ensureCardOnVisit() {
  const { user } = await getCurrentUserWithRole();
  if (!user) return;
  await ensureMemberCard(user.id, { memberType: 'FREE' });
}
```

### src/app/(member)/page.tsx

```tsx
import { ensureCardOnVisit } from '@/features/membership/server/ensure-on-visit';
import MemberCardPanel from '@/features/membership/member-card-panel';
import { LinkButton } from '@/components/ui/link-button';
import { VipCtaButton } from '@/components/common/vip-cta-button';
import { Section } from '@/components/ui/section';

export default async function MemberHomePage() {
  await ensureCardOnVisit();

  return (
    <Section>
      <h1 className="h2">Member</h1>
      <p className="mt-1 body-sm text-fgMuted">
        Special conditions are available to club members after sign‑in. Browse partners in the catalog.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="h3 mb-3">Your Digital Card</h2>
          <MemberCardPanel />
        </div>

        <div>
          <h2 className="h3 mb-3">Actions</h2>
          <div className="flex flex-col gap-3">
            <LinkButton href="/catalog" variant="gold">Open Catalog</LinkButton>
            <VipCtaButton label="Upgrade to VIP — $19.99/mo" />
          </div>

          <p className="mt-4 text-xs text-fgMuted">
            KYLYVNYK CLUB is an independent private membership platform. Special conditions are provided by independent partners.
          </p>
        </div>
      </div>
    </Section>
  );
}
```

## Acceptance

- Visiting /member ensures a card exists and displays it.
- Clear CTAs to Catalog and VIP upgrade.
- No PII leaked; language keeps legal phrasing.

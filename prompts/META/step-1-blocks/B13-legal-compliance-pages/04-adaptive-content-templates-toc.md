# 04-adaptive-content-templates-toc.md

## Title

Adaptive Legal Templates — section model + Table of Contents

## Objective

Provide a reusable LegalArticle component to compose long-form legal pages with auto-generated anchors and an in-page Table of Contents (TOC).

## Steps

1) Create a LegalArticle component that:
   - Accepts title, updatedAt, and sections: { id, title, content }[].
   - Renders a right/inline TOC linking to section anchors.
2) Refactor one page (e.g., Terms) to use LegalArticle.
3) Keep content pure JSX to avoid extra MDX setup.

## Files to add/modify

- src/features/legal/legal-article.tsx
- src/app/(public)/legal/terms/page.tsx (refactor to use LegalArticle)

### src/features/legal/legal-article.tsx

```tsx
import { LEGAL } from '@/config/legal';
import Link from 'next/link';

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function LegalArticle({
  title,
  updatedAtISO = LEGAL.lastUpdatedISO,
  sections,
}: {
  title: string;
  updatedAtISO?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_280px]">
      <article className="prose prose-invert max-w-none">
        <h1>{title}</h1>
        <p>Last updated: {new Date(updatedAtISO).toLocaleDateString()}</p>
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <h2>{s.title}</h2>
            <div>{s.content}</div>
          </section>
        ))}
      </article>

      <aside className="md:sticky md:top-20 h-max rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-semibold mb-2">Contents</div>
        <nav className="text-sm">
          <ol className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <Link href={`#${s.id}`} className="hover:text-gold-400">
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
    </div>
  );
}
```

### src/app/(public)/legal/terms/page.tsx (refactor)

```tsx
import { LEGAL } from '@/config/legal';
import { LegalArticle } from '@/features/legal/legal-article';

export const metadata = { title: `Terms of Use — ${LEGAL.entityName}` };

export default function TermsPage() {
  const S = {
    about: {
      id: 'about',
      title: `About ${LEGAL.entityName}`,
      content: (
        <p>
          {LEGAL.entityName} is an {LEGAL.entityDescription}. Special conditions are provided
          directly by independent third‑party partners. {LEGAL.entityName} does not guarantee savings,
          income, commissions, bonuses, clients or business results. Partners are responsible for their
          own licenses, permits and compliance. {LEGAL.entityName} does not participate in transactions,
          negotiations or agreements between users and partners.
        </p>
      ),
    },
    eligibility: {
      id: 'eligibility',
      title: 'Eligibility and Accounts',
      content: (
        <ul>
          <li>You must provide accurate information and keep your account secure.</li>
          <li>We may suspend or terminate access for violations or legal/safety reasons.</li>
        </ul>
      ),
    },
    membership: {
      id: 'membership',
      title: 'Membership',
      content: (
        <ul>
          <li>FREE: digital card and catalog access.</li>
          <li>VIP: subscription‑based; cancellation at period end.</li>
          <li>High‑risk categories are not permitted.</li>
        </ul>
      ),
    },
    ip: {
      id: 'ip',
      title: 'Intellectual Property',
      content: <p>Content and trademarks belong to respective owners. No unauthorized use.</p>,
    },
    acceptableUse: {
      id: 'acceptable-use',
      title: 'Acceptable Use',
      content: <p>No unlawful, fraudulent, misleading, or harmful activities.</p>,
    },
    disclaimers: {
      id: 'disclaimers',
      title: 'Disclaimers',
      content: (
        <p>
          {LEGAL.entityName} provides the platform “as is” without warranties of any kind, including
          implied warranties of merchantability, fitness for a particular purpose, and non‑infringement.
        </p>
      ),
    },
    liability: {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      content: (
        <p>
          To the maximum extent permitted by law, {LEGAL.entityName} and its affiliates are not liable
          for indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss
          of profits, revenues, data, or goodwill, arising from or related to your use of the platform
          or interactions with partners.
        </p>
      ),
    },
    arbitration: {
      id: 'governing-law-arbitration',
      title: 'Governing Law; Arbitration; Waiver of Class Actions',
      content: (
        <>
          <p>These Terms are governed by the laws of the {LEGAL.governingLaw}.</p>
          <p>
            Any dispute will be resolved by binding individual arbitration administered by the {LEGAL.arbitrationProvider}.
            You and {LEGAL.entityName} waive any right to a jury trial or to participate in a class action.
          </p>
        </>
      ),
    },
    modifications: {
      id: 'modifications',
      title: 'Modifications',
      content: <p>We may update these Terms with a new “Last updated” date.</p>,
    },
    contact: {
      id: 'contact',
      title: 'Contact',
      content: (
        <p>
          Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> or visit{' '}
          <a href={LEGAL.contactUrl}>Contact</a>.
        </p>
      ),
    },
  };

  return (
    <LegalArticle
      title="Terms of Use"
      sections={[
        S.about,
        S.eligibility,
        S.membership,
        S.ip,
        S.acceptableUse,
        S.disclaimers,
        S.liability,
        S.arbitration,
        S.modifications,
        S.contact,
      ]}
    />
  );
}
```

## Acceptance

- LegalArticle renders headings with in-page TOC and anchors.
- Terms page refactored to use section model; other pages can adopt later.
- No promises of income/MLM language; arbitration and limitations included.

—

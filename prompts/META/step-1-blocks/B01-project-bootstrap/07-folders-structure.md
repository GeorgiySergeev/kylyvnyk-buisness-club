# 07-folders-structure.md

## Title

Create Feature-first Folder Structure (App Router)

## Objective

Establish a scalable folder layout for features, UI, and infra modules.

## Steps

1. Create route groups

- src/app/(public), (auth), (member), (business), (admin)

1. Create base infra and features folders

- src/components/ui, src/components/common
- src/features/{auth,membership,catalog,business,stripe,admin,legal}
- src/lib/{db,auth,stripe,redis,captcha,validation,i18n,utils}
- src/db/schema
- src/styles, src/types, src/config

1. Add placeholder files and a sample page

## Example tree

```
src/
  app/
    (public)/
      layout.tsx
      page.tsx
    (auth)/
      layout.tsx
      page.tsx
    (member)/
      layout.tsx
      page.tsx
    (business)/
      layout.tsx
      page.tsx
    (admin)/
      layout.tsx
      page.tsx
  components/
    ui/README.md
    common/README.md
  features/
    auth/README.md
    membership/README.md
    catalog/README.md
    business/README.md
    stripe/README.md
    admin/README.md
    legal/README.md
  lib/
    db/README.md
    auth/README.md
    stripe/README.md
    redis/README.md
    captcha/README.md
    validation/README.md
    i18n/README.md
    utils/README.md
  db/
    schema/README.md
  styles/README.md
  types/README.md
  config/README.md
```

## Sample files

### src/app/(public)/layout.tsx

```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
```

### src/app/(public)/page.tsx

```tsx
export default function HomePage() {
  return <section>KYLYVNYK CLUB — Bootstrap OK</section>;
}
```

## Acceptance

- next dev shows the sample Home page
- All folders exist and tracked in Git

—

Напиши “B02” — пришлю следующий блок (Design System & Theming) в .md формате по шагам.

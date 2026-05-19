# 01-init-nextjs-ts-eslint-prettier.md

## Title

Bootstrap Next.js (App Router) + TypeScript + ESLint + Prettier

## Objective

Create a Next.js 15 project with App Router, TypeScript, ESLint (next/core-web-vitals), and Prettier. Ensure import sorting and clean code defaults.

## Steps

1) Create project (prefer pnpm)

- Name: kylyvnyk-club
- App Router: Yes
- TypeScript: Yes
- ESLint: Yes
- Src directory: Yes (src/)
- Tailwind: No (installed later)
- Import alias: Yes (@/*)

1) Install Prettier + ESLint plugins

- prettier, eslint-config-prettier, eslint-plugin-simple-import-sort, eslint-plugin-unused-imports, @trivago/prettier-plugin-sort-imports

1) Configure ESLint rules for import sorting and unused imports

2) Add scripts: dev, build, start, lint, format, typecheck

## Commands

```bash
pnpm create next-app@latest kylyvnyk-club
cd kylyvnyk-club

pnpm add -D prettier eslint-config-prettier eslint-plugin-simple-import-sort eslint-plugin-unused-imports @trivago/prettier-plugin-sort-imports
```

## Files to add/modify

- .prettierrc
- .prettierignore
- .eslintrc.json (augment)
- package.json (scripts)

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": ["^react$", "<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### .prettierignore

```
.next
node_modules
dist
out
drizzle
.env*
coverage
```

### .eslintrc.json (merge or create)

```json
{
  "extends": ["next/core-web-vitals", "eslint:recommended", "plugin:react/recommended", "prettier"],
  "plugins": ["simple-import-sort", "unused-imports"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "unused-imports/no-unused-imports": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn"
  }
}
```

### package.json (scripts)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

## Acceptance

- pnpm lint → no errors
- pnpm format → formats files
- pnpm typecheck → no TS errors
- pnpm dev → app runs

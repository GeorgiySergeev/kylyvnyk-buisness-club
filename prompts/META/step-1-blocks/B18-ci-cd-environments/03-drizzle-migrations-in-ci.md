# 03-drizzle-migrations-in-ci.md

## Title

Drizzle migrations — run safely in CI/CD

## Objective

Apply SQL migrations automatically on main (production) and optionally on preview databases with manual control.

## Approach A (recommended)

- Production migrations run on main with protected environment.

### .github/workflows/migrate.yml

```yaml
name: DB Migrate

on:
  workflow_dispatch:
  push:
    branches: [main]

concurrency:
  group: migrate-${{ github.ref }}
  cancel-in-progress: false

jobs:
  migrate:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NODE_ENV: production
        run: pnpm db:migrate
```

## Optional Approach B (preview DB)

- Add separate workflow with environment: staging and its own DATABASE_URL secret.
- Trigger on pull_request labeled "preview-db" to migrate a staging DB for QA.

## Safety notes

- Keep backups/PITR enabled (see Security/Backups block).
- Never run destructive migrations without explicit review.
- Idempotent migrations help safe re-runs.

## Acceptance

- Migrations succeed on main (or manual dispatch).
- Failures block deploy until resolved.

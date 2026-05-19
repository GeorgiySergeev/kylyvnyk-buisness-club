# 04-ci-lint-type-checks.md

## Title

CI — lint, typecheck, unit tests

## Objective

Run core quality gates on every PR and push to main.

## Steps

1) Create .github/workflows/ci.yml:

- Setup Node 20.x, pnpm
- Cache pnpm store
- Install deps
- Run lint, typecheck, unit tests
- Upload vitest coverage as artifact

## Workflow

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Typecheck
        run: pnpm typecheck
      - name: Unit tests
        run: pnpm test
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vitest-coverage
          path: coverage
```

## Acceptance

- CI runs on PRs and main.
- Lint/typecheck/tests pass; coverage artifact uploaded.

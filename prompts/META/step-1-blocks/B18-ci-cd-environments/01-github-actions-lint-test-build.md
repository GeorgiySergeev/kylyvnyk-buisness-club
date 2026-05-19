# 01-github-actions-lint-test-build.md

## Title

GitHub Actions — lint, typecheck, unit tests, build

## Objective

Run core quality gates on every PR and main. Ensure production build compiles.

## Steps

1) Add workflow ci.yml for QA (lint, typecheck, unit).
2) Add workflow build.yml to ensure next build works.

## Files

### .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [ main ]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  qa:
    runs-on: ubuntu-latest
    env:
      NEXT_TELEMETRY_DISABLED: 1
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

### .github/workflows/build.yml

```yaml
name: Build

on:
  pull_request:
  push:
    branches: [ main ]

concurrency:
  group: build-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NEXT_TELEMETRY_DISABLED: 1
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
      - name: Build
        run: pnpm build
```

## Acceptance

- CI runs on every PR and main; artifacts uploaded.
- Build passes reproducibly with pnpm lockfile.

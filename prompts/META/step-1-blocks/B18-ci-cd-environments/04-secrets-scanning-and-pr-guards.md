# 04-secrets-scanning-and-pr-guards.md

## Title

Secrets scanning & PR guards — prevent leaks and high‑risk content

## Objective

- Scan repository for secrets on every PR.
- Block PRs introducing banned/high‑risk keywords (MLM/income promises/etc.).

## Steps

1) Add Gitleaks workflow to scan repo.
2) Add a custom guard script to scan staged diff for banned keywords.
3) Wire both to PR checks.

## Files

### .github/workflows/scan.yml

```yaml
name: Security Scan

on:
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: zricethezav/gitleaks-action@v2
        with:
          # default config is fine; scanning full repo
          args: "--verbose --redact"
  highrisk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Check banned keywords
        run: node scripts/ci/check-highrisk.js
```

### scripts/ci/check-highrisk.js

```js
#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');

const banned = [
  'mlm',
  'pyramid',
  'get rich',
  'guaranteed income',
  'passive income',
  'casino',
  'ico',
  'airdrop',
  'firearms',
  'adult'
];

try {
  const diff = execSync('git diff --cached', { encoding: 'utf8' }).toLowerCase();
  const hit = banned.find((k) => diff.includes(k));
  if (hit) {
    console.error(`High-risk keyword detected in PR: "${hit}"`);
    process.exit(1);
  }
  console.log('No high-risk keywords detected in staged changes.');
} catch (e) {
  console.error('Failed to scan diff:', e.message);
  process.exit(1);
}
```

## Acceptance

- PR fails if secrets are detected by Gitleaks.
- PR fails if banned keywords appear in staged diff.
- Green pipeline when repo is clean and compliant.

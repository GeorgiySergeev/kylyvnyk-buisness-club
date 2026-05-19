# 06-dx-tooling-husky-commitlint.md

## Title

DX Tooling: Husky, lint-staged, commitlint

## Objective

Enforce code quality via pre-commit hooks and Conventional Commits.

## Steps

1) Install tooling deps
2) Init Husky
3) Configure lint-staged and commitlint in package.json
4) Add pre-commit and commit-msg hooks

## Commands

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm dlx husky init
```

## Files to modify/create

### package.json (append)

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": ["prettier --write"],
    "*.{ts,tsx,js,jsx}": ["eslint --fix"]
  },
  "commitlint": { "extends": ["@commitlint/config-conventional"] }
}
```

### .husky/pre-commit

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
pnpm lint
pnpm typecheck
pnpm -s lint-staged
```

### .husky/commit-msg

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
pnpm commitlint --edit "$1"
```

## Acceptance

- Bad commit messages are rejected
- Unformatted code is formatted on commit
- Lint/typecheck pass pre-commit

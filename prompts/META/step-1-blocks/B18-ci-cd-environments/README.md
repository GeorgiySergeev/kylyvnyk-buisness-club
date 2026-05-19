# B18-ci-cd-environments

---

# README.md

## Title

CI/CD & Environments — principles

## Objective

- Make PRs safe (automated QA gates).
- Keep deploys reproducible (locked deps, deterministic builds).
- Apply DB migrations safely.
- Protect secrets; block high‑risk content/categories.

## Environments

- Local: developers run dev server, seeds, mocks.
- Preview (Vercel): every PR gets an isolated URL, Stripe test keys.
- Production (Vercel): main branch only, protected env and secrets.

## Pipeline overview

- CI (PR): lint → typecheck → unit tests → build.
- E2E optional on protected branches.
- Security scan on PR (secrets + high‑risk keywords).
- Migrations job on main or manual dispatch with protected env.

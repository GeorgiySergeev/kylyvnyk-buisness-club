# PROMPT-GUIDELINES — How to write a prompt for KCLUB

Rules for **authoring** a prompt step. Complements `STYLE-GUIDE.md` (which
covers style) and `NAMING-CONVENTIONS.md` (which covers names).

> If a prompt does not pass this checklist, do not merge it.

---

## 1. One prompt = one atomic change

A single step file makes exactly one change to the repo. Heuristic:

- One PR ≤ 400 lines of diff worth of work.
- One acceptance section ≤ 6 bullets.
- If you need more, split into `0X-...md` and `0Y-...md`.

Rationale: agents are most reliable when the change set is small and
verifiable. Big prompts produce big drift.

---

## 2. Mandatory sections (from STYLE-GUIDE §3)

Re-stated here for the author's checklist:

- [ ] `# Title` with BlockID.StepID
- [ ] Front-matter block (Phase, Block, Step, Depends on, Superseded-By)
- [ ] `## Objective` (1 sentence)
- [ ] `## Inputs`
- [ ] `## Steps`
- [ ] `## Files to add / modify`
- [ ] `## Outputs`
- [ ] `## Acceptance`
- [ ] `## Rollback`
- [ ] `## Verification command`

Missing any → reject in review.

---

## 3. Inputs section — what to list

Inputs are *preconditions* the agent can rely on. Be specific.

Good:
```
- Repo at HEAD of branch `chore/<...>` after merging Patch-01..05.
- `package.json` already contains `@clerk/nextjs@^6`, `drizzle-orm@^0.36`.
- Env vars `CLERK_SECRET_KEY`, `DATABASE_URL` are present in `.env.local`.
- Schema files under `src/db/schema/` exist and `pnpm db:push` ran cleanly.
```

Bad:
```
- The project is set up.
- Clerk is configured.
```

If an input is missing in the actual repo when the agent runs, the agent MUST
stop and report (per `AGENTS.md §11`).

---

## 4. Steps section — granularity

- Each step is one verb, one object.
- 1–12 steps total. More → split.
- No nested numbering. Use sub-bullets only for parameters of the same step.

Good:
```
1. Add `src/lib/stripe/period.ts` with `getSubscriptionPeriod`.
2. Update `app/api/stripe/webhook/route.ts` to use `getSubscriptionPeriod`.
3. Add unit tests in `src/lib/stripe/period.spec.ts`.
4. Bump `apiVersion` in `src/lib/stripe/config.ts` to `2024-12-18.acacia`.
5. Update `.env.example` with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
```

Bad:
```
1. Set up Stripe properly.
2. Make sure idempotency works.
3. Add tests.
```

---

## 5. Files to add / modify — exhaustive

List **every** file the agent is allowed to touch. Three states only:

- `create` — file does not exist.
- `modify` — file exists.
- `delete` — file exists and must be removed.

If the agent touches a file not in this list, the PR is rejected. This is
the main lever against scope creep.

Example:
```
- src/lib/stripe/period.ts                   — create
- src/lib/stripe/period.spec.ts              — create
- src/lib/stripe/config.ts                   — modify
- app/api/stripe/webhook/route.ts            — modify
- .env.example                               — modify
- docs/ENV.md                                — modify
```

---

## 6. Outputs section — declare side effects

Outputs are everything the world sees after the step beyond the file list:

- New env vars (`STRIPE_WEBHOOK_SECRET`).
- New `package.json` scripts (`db:seed`).
- New routes / actions (`POST /api/stripe/webhook`).
- New DB tables / columns / indexes (with names).
- New CI checks (`forbidden-vocab-grep`).
- New translation namespaces (`messages/en/billing.json`).

If a side effect is not listed, it doesn't happen.

---

## 7. Acceptance section — must be machine-checkable

See `STYLE-GUIDE §10`. Three legal shapes:

1. A command + expected exit code:
   ```
   pnpm test src/lib/stripe/period.spec.ts   # exit 0
   ```
2. An assertion on output:
   ```
   Response body JSON has exactly keys: number, memberName, memberType, status, expiresAt.
   ```
3. A test name:
   ```
   webhook.e2e.ts > replay same event.id is idempotent
   ```

Each acceptance bullet is independently verifiable. No "and / or" chains.

---

## 8. Rollback — required, not optional

Every step lists how to undo it. One of:

- `git revert <expected-commit-subject>` — the simple case.
- A specific list:
  ```
  - Remove src/lib/stripe/period.ts and its spec.
  - Revert config.ts apiVersion to previous value.
  - `pnpm db:drop` only if migration was committed (it wasn't in this step).
  ```
- "Not applicable — additive only, no destructive change."

Why mandatory: agent runs fail. Without rollback the human spends 30
minutes figuring out what to undo.

---

## 9. Verification command

One shell snippet. Run it after the step. If it exits 0, success.

```bash
pnpm lint && pnpm typecheck && pnpm test src/lib/stripe/ && pnpm build
```

Keep it under 5 commands chained with `&&`. If you can't fit verification
into 5 commands, your step is too big.

---

## 10. Snippets section — when to inline code

Inline code only when:

- The code is short (< 80 lines).
- The code is non-obvious (idempotency pattern, CSP allowlist, regex).
- The exact text matters (legal copy, locale strings).

Do NOT inline code that is essentially boilerplate. Instead instruct the
agent to generate it (e.g. "scaffold a Next.js page with `useTranslations`").

---

## 11. Out of scope — protect the next prompt

If you can predict that an agent might "helpfully" extend the work, list it
under `## Out of scope`:

```
## Out of scope
- UI for displaying past Stripe events (covered by step 06).
- Admin replay button (covered by B12).
- Customer Portal integration (covered by step 05).
```

This single section saves more PR-revert pain than any other.

---

## 12. Cross-referencing other prompts

When step X depends on step Y, say so explicitly in front-matter
`Depends on:` AND link in `Inputs`. Do not rely on the agent inferring the
chain from filenames.

When step X **replaces** an older step, set front-matter
`Superseded-By:` on the OLD file, not the new one. The new file is the
authoritative source; the old file just points forward.

---

## 13. Lifecycle of a prompt

```
draft        →  in PR, not yet merged. Filename suffix: `.draft.md`.
active       →  merged, agents will run it.
superseded   →  newer version exists; front-matter Superseded-By: <path>.
deprecated   →  do not run; kept for history. Move to /prompts/META/_archive/.
```

A prompt never silently disappears. Either supersede or archive.

---

## 14. Review checklist (paste into PR description)

```
- [ ] Front-matter block complete (Phase/Block/Step/Depends on/Superseded-By)
- [ ] Objective is one sentence
- [ ] Inputs list real preconditions, not "project is set up"
- [ ] Steps are 1–12 atomic actions
- [ ] Files to add/modify is exhaustive
- [ ] Outputs declares all side effects (env, scripts, routes, tables, i18n)
- [ ] Acceptance bullets are machine-checkable
- [ ] Rollback present (even if "additive only")
- [ ] Verification command is ≤ 5 chained commands
- [ ] No forbidden vocabulary (grep clean)
- [ ] No `should`, `might`, `consider`, `best practice`
- [ ] Length ≤ 250 lines
- [ ] Snippets ≤ 80 lines each, with path comments
```
# STYLE-GUIDE — KCLUB Prompt Library

How prompts are written. Applies to every file under `prompts/META/`.
Read once, then enforce in every PR that touches a prompt.

> If a prompt deviates from this guide, fix the prompt — do not weaken the guide.

---

## 1. Audience

Every prompt is written for **one** of two readers, simultaneously:

1. **A human developer** scanning the file before pressing "run".
2. **An AI coding agent** (Opencode, Cursor, Claude Code, Codex) executing it.

Optimize for both. That means:

- Imperative voice, present tense (`Create...`, `Add...`, `Wire...`).
- No background prose, no marketing, no "we will now".
- Every claim must be actionable or verifiable.

---

## 2. Language

- **Prompt body language: English.** Always. Even if SPEC is RU.
- User-facing copy inside code snippets follows the locale rules in
  `/AGENTS.md §9`. In MVP that's `en` only.
- Russian/Ukrainian copy only appears inside `messages/<locale>/*.json`
  blocks when explicitly demonstrating i18n. Never in instructions.

Why English: agents are most consistent in English, terminology matches the
SDKs (Clerk, Stripe, Drizzle, Next), and code identifiers are English anyway.

---

## 3. File-level structure (mandatory shape)

Every step file MUST have these sections, in this order:

```md
# <BlockID>.<StepID> — <Short Title>

> Phase: 1 | 2 | 3 | 4
> Block: B0X-<slug>
> Step:  0Y
> Depends on: <previous step IDs, or "—">
> Superseded-By: <path, or "—">

## Objective
One sentence. What this step achieves. No "why" here — that's for SPEC.

## Inputs (preconditions)
- Repo state expected before running this step (files, env, packages).
- Tools available to the agent.

## Steps
Numbered, imperative. Each item is one atomic action.

## Files to add / modify
- `path/to/file.ts` — create | modify | delete

## Outputs (postconditions)
- New files / modified files
- New env vars (mirror to `.env.example` + `docs/ENV.md`)
- New scripts in `package.json`
- New routes / actions / DB tables

## Acceptance
- Verifiable bullets. Each one is a command, an assertion, or a test name.

## Rollback
How to undo the step cleanly. One command or one short list.

## Verification command
A single shell snippet the agent can run to confirm success.
```

Optional appendix sections (use when relevant, in this order):

- `## Snippets` — reference code blocks.
- `## Notes` — gotchas, links to SDK docs.
- `## Out of scope` — things deliberately left for later steps.

---

## 4. Heading levels

- `#` once, on the first line (the step title).
- `##` for the mandatory sections above.
- `###` for sub-sections inside Snippets / Notes.
- Never skip levels. No `####` unless really needed.

---

## 5. Code blocks

- Always fenced with a language tag: ` ```ts `, ` ```tsx `, ` ```bash `,
  ` ```sql `, ` ```json `, ` ```env `.
- First line of every code block is a path comment:
  ```ts
  // src/lib/foo.ts
  export function foo() { /* ... */ }
  ```
  For shell blocks, no path comment — start with the command.
- No `// TODO` in committed snippets. Either implement it or move it out
  of the snippet into a `## Notes` bullet.
- Prefer **complete files** over fragments. If a fragment is necessary,
  prefix it with a comment explaining what surrounds it.

---

## 6. Voice and tone

- Imperative, terse, deterministic.
- Forbidden phrases (they signal vagueness): "should", "might", "consider",
  "feel free to", "as you see fit", "best practice", "modern approach",
  "robust", "scalable". If you use one, replace it with a concrete instruction.
- Allowed: "MUST", "DO NOT", "if X then Y", "exit with error if Z".
- Numbers over adjectives. Not "rate-limit aggressively" → "10 requests /
  IP / minute via Upstash".

---

## 7. Determinism

A good prompt produces the same result on two independent agent runs given
the same repo state. Enforce:

- Pin versions (`drizzle-orm@^0.36`, not `latest`).
- Pin Stripe `apiVersion`.
- Pin Node and pnpm via `.nvmrc` / `packageManager`.
- Never write "install the latest X". Always write the version.
- For random IDs (card numbers, slugs), specify the generator and seed
  strategy.

---

## 8. References and links

- Reference other prompts and docs by repo-relative path:
  ` /docs/SPEC.md§3 ` or ` prompts/META/step-2-drizzle-ddl/README.md `.
- Do NOT link external blogs or Medium articles. SDK docs only.
- If an SDK link is essential, copy the relevant snippet into the prompt
  (with the SDK version) so the prompt survives broken links.

---

## 9. PII and legal hygiene inside prompts

- No real names, real emails, real card numbers in examples. Use
  `alice@example.com`, `VIP-UA-CROCK10000`, `Acme Coffee LLC`.
- Forbidden vocabulary (`AGENTS.md §4`) applies to prompt text too, not just
  to generated code. CI greps `prompts/` the same way it greps `app/`.

---

## 10. Acceptance criteria — quality bar

Each acceptance bullet must be one of:

1. **Command** — `pnpm test path/to/file.spec.ts`.
2. **Assertion** — "response body has exactly keys `[a,b,c,d,e]`".
3. **Negative assertion** — "no row in `stripe_events` with `succeeded=false`
   after replay".
4. **Test name** — `verify-card.spec.ts > rejects 11th request from same IP`.

Forbidden as acceptance: "looks good", "works", "no errors".

---

## 11. Length budget

- Step file: **≤ 250 lines** of markdown. If longer — split into sub-steps.
- README.md of a block: ≤ 100 lines, just an index of its steps.
- Snippets inside a step: ≤ 80 lines per snippet. Bigger code goes into the
  actual source tree, the prompt just instructs to create the file.

---

## 12. Examples — good vs bad

**Bad:**
> Let's add Stripe webhook handling. We should make it robust and handle
> common edge cases. Don't forget idempotency.

**Good:**
> ## Objective
> Add `POST /api/stripe/webhook` that verifies signature, claims the event
> atomically in `stripe_events`, dispatches to `handleStripeEvent`, and
> returns 200 on success, 500 on handler failure (so Stripe retries).
>
> ## Acceptance
> - Replay test: same `event.id` sent twice → handler invoked once.
> - Bad signature → 400, no row inserted.
> - Handler throws → 500, `stripe_events.error` populated, row remains
>   `succeeded=false`.
# CONTRIBUTING — Prompt library

How to add, change, supersede, or remove a prompt. Read before opening any
PR under `prompts/META/`.

> This file is about *prompts*. For the project's general contribution
> guide (commits, branches, code review), see `/CONTRIBUTING.md` at the
> repo root (when it lands).

---

## 1. When to touch this folder

Touch `prompts/META/` when you want to:

- Add a new step to an existing block.
- Add a new block (B20+).
- Patch a bug in an existing prompt (Clerk version, Stripe API change, etc.).
- Supersede a Phase-1 scaffold with a Phase-2/3 implementation.
- Archive a deprecated prompt.

Do NOT touch this folder for:

- Code-only changes (those go to `src/`).
- Doc-only changes about the product (`docs/SPEC.md`).
- Stack decisions (`docs/STACK-DECISION.md`).

---

## 2. Workflow

```bash
git checkout main && git pull
git checkout -b prompts/<short-slug>
# edit / add prompt files
git add prompts/META/...
git commit -m "docs(prompts): <conventional-commit subject>"
git push -u origin prompts/<short-slug>
# open PR, fill the checklist from PROMPT-GUIDELINES §14
```

Branch naming: `prompts/<short-slug>`. Examples:
`prompts/b05-stripe-webhook-idempotency`, `prompts/b20-new-block-search`.

---

## 3. Adding a new step

1. Pick the block (`B05-billing-stripe`).
2. Pick the next free number (`07-...`).
3. Create the file using the template (§7 below).
4. Update `prompts/META/INDEX.md` if the new step changes the execution
   order or supersedes an older step.
5. Open a PR with the checklist from `PROMPT-GUIDELINES §14`.

---

## 4. Adding a new block

1. Decide if it's truly a new block or a step inside an existing one. New
   blocks are expensive — they imply a new domain area.
2. Reserve the next block number (B20, B21, ...). Do not reuse old numbers
   even after archival.
3. Create the folder `B<NN>-<kebab-slug>/` with:
   - `README.md` — block index (≤ 100 lines, lists steps).
   - `01-<slug>.md`, `02-...`, ...
4. Update `prompts/META/INDEX.md` Phase 1 table.
5. If the block depends on a previous one, set `Depends on:` in front-matter
   on the first step.

---

## 5. Patching an existing prompt

Two strategies — pick by impact:

### 5a. Inline patch (small, additive)

For typo fixes, version bumps in pinned deps, additional acceptance bullets:

- Edit the file in place.
- Bump no version.
- Commit subject: `fix(prompts): <subject>`.

### 5b. Patch file (behavior change, breaks history)

For changes that materially alter what the agent will do (Clerk v6 async,
Stripe API version migration, schema column type):

1. Create a patch document under `prompts/META/PATCHES/Patch-<NN>-<slug>.md`.
2. Reference it from `prompts/META/INDEX.md` Phase 5 table.
3. Optionally add a banner to the target prompt:
   ```md
   > ⚠️ See `prompts/META/PATCHES/Patch-01-clerk-v6-async-auth.md` before running.
   ```
4. Do NOT silently overwrite the original prompt — that destroys context.

Patch IDs follow risk IDs from review documents (Patch-01, 02, 03, 04, 05,
08 already used). Pick the next free ID; numbering gaps are fine.

---

## 6. Superseding a prompt

When a Phase-2/3 prompt replaces a Phase-1 scaffold:

1. Add `Superseded-By: <path>` to the front-matter of the OLD file.
2. Update `prompts/META/INDEX.md`:
   - Phase 1 table: mark the block/step as superseded.
   - Phase 2/3 table: note what it replaces.
3. Do NOT delete the old file. Keep it for context.

Example:

```md
# B04.03 — Roles and profile attributes

> Phase: 1
> Block: B04-auth-clerk-rbac
> Step:  03
> Depends on: B04.02
> Superseded-By: prompts/META/step-3-implementations/01-auth-clerk/03-role-and-profile-attributes.md
```

---

## 7. Step template (copy-paste)

```md
# B<NN>.<SS> — <Short Title>

> Phase: 1
> Block: B<NN>-<slug>
> Step:  <SS>
> Depends on: <step IDs, or "—">
> Superseded-By: —

## Objective
<one sentence>

## Inputs
- <precondition>
- <precondition>

## Steps
1. <atomic action>
2. <atomic action>
3. <atomic action>

## Files to add / modify
- <path> — create | modify | delete

## Outputs
- <env var, script, route, table, namespace>

## Acceptance
- <command, assertion, or test name>
- <command, assertion, or test name>

## Rollback
<command or list>

## Verification command
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Snippets (optional)

## Notes (optional)

## Out of scope (optional)
```

---

## 8. Archiving

Move a prompt to `prompts/META/_archive/<original-path>` when:

- It has been superseded for more than 2 releases.
- It documents a stack we no longer use.

In `_archive/`, the file is read-only context. Agents are instructed to
ignore `_archive/` via `AGENTS.md`.

Never `git rm` a prompt; archive it instead.

---

## 9. CI gates on prompt PRs

A PR touching `prompts/META/` runs:

- Markdown lint (heading levels, fenced code blocks have language tag).
- Forbidden-vocab grep (`AGENTS.md §4`).
- Front-matter parser (rejects PRs where mandatory keys are missing).
- INDEX.md cross-ref check (every prompt is referenced; every reference
  resolves).
- Length budget (`STYLE-GUIDE §11`).

A failing gate blocks merge. Do not bypass.

---

## 10. Review SLA and reviewers

- One reviewer is enough for inline patches (§5a).
- Two reviewers for new blocks (§4) and supersession (§6).
- Stack decisions inside a prompt (e.g. switching auth provider) require an
  ADR in `docs/` first; the prompt PR only references the ADR.

Review turnaround target: 24 business hours.

---

## 11. Commit message examples

```
feat(prompts/b20): add search infrastructure block
fix(prompts/b05): pin stripe apiVersion 2024-12-18.acacia
docs(prompts): add Patch-09 for CSP allowlist
refactor(prompts/b04): split B04.03 into 03a auth and 03b profile
chore(prompts): archive B0X-old-supabase-auth
```

---

## 12. Common review rejections (and how to avoid them)

| Rejection                              | Fix                                                         |
| -------------------------------------- | ----------------------------------------------------------- |
| "Acceptance bullets are vague"         | Each bullet must be a command, assertion, or test name      |
| "Touches files outside the list"       | Make `Files to add/modify` exhaustive                       |
| "Uses `should` / `might`"              | Replace with `MUST` / `if X then Y`                         |
| "No rollback section"                  | Add it. If truly additive, write `Not applicable — additive only` |
| "Front-matter missing Superseded-By"   | Add `—` if not applicable                                   |
| "Length > 250 lines"                   | Split into sub-steps                                        |
| "Snippet has no path comment"          | First line of every code block: `// path/to/file`           |
| "Forbidden vocab grep failed"          | See `AGENTS.md §4`                                          |
| "INDEX.md not updated"                 | Add the new step/block/patch row                            |
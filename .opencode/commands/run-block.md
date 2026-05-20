# /run-block

Execute a Phase-1 block from the prompt library.

## Usage

```
/run-block B05
/run-block B05 03   # only step 03
```

## What this command does

1. Read `prompts/META/INDEX.md` to confirm the block is not superseded by a
   Phase-2 or Phase-3 entry. If it is — STOP and tell the user which
   replacement to run instead.
2. Read all patch files in `prompts/META/PATCHES/` that target the block.
   Apply patches mentally (do not rewrite the originals). Quote them in the
   PR description.
3. Read the block's `README.md` and each numbered step file in order
   (or only the specified step number).
4. For each step:
   a. Check `Inputs` preconditions. If any is missing, STOP and ask.
   b. Apply the changes per the step's `Files to add / modify` list.
   Touch NOTHING outside that list.
   c. Run the step's `Verification command`.
   d. If verification fails, do NOT proceed. Report the failure verbatim.
5. After all steps in scope: run `pnpm verify`. If green, summarize.
6. Output: unified diff per file + a checklist of acceptance criteria
   you verified (quote each criterion from the step).

## Refusals

- Refuse if the user has uncommitted changes (run `git status` first).
- Refuse if `pnpm install` has never run in this checkout
  (`node_modules` missing).
- Refuse if any of `AGENTS.md`, `prompts/META/INDEX.md`,
  `docs/STACK-DECISION.md` is empty.

# /new-prompt

Scaffold a new step file under `prompts/META/step-1-blocks/<block>/`,
using the template from `prompts/META/CONTRIBUTING.md §7`.

## Usage

```
/new-prompt B05 07 "add-customer-portal-link"
```

## What this command does

1. Confirm the block exists. If not, refuse and suggest using `/new-block`.
2. Confirm step number is free (no existing `07-*.md` in the block).
3. Create `prompts/META/step-1-blocks/B05-billing-stripe/07-add-customer-portal-link.md`
   pre-filled with:
   - Front-matter (Phase, Block, Step, Depends on filled, Superseded-By: —)
   - Empty mandatory sections per `STYLE-GUIDE.md §3`
   - `## Inputs` referencing relevant ADRs from `STACK-DECISION.md`
4. Update `prompts/META/INDEX.md` Phase 1 table row for the block.
5. Output: created file as a code fence + diff for INDEX.md.

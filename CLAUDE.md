# CLAUDE.md

> **Note:** These files (`CLAUDE.md` + `.github/copilot-instructions.md`) are pointers. They do not duplicate `AGENTS.md`, but reference it. This is a deliberate decision: a single source of truth with thin adapters for each tool.

Claude Code: read `/AGENTS.md` first. That file is the single source of truth for agent behavior on this repo.

## Quick orientation (Claude-specific)

- **Output format**: Unified diff by default.
- **New files**: Full content in fenced blocks with the path on line 1 as a comment.
- **One PR = one logical change**: If the task spans multiple concerns, ask the user to split before starting.
- **Tools**: Default to `read`, `edit`, `bash`. Use `bash` only for commands listed in `.opencode/config.json` `tools.bash.allow`.
- **Restrictions**:
  - Never `git push`, `git reset --hard`, `rm -rf`, or modify `.env*`.
  - Never `pnpm add <package>` without an explicit user request that names the package and version.

## File precedence (re-stated)

1. `AGENTS.md`
2. `docs/STACK-DECISION.md`
3. `prompts/META/INDEX.md`
4. `prompts/META/step-2-drizzle-ddl/README.md`
5. `prompts/META/step-3-implementations/*`
6. `prompts/META/step-1-blocks/B*`
7. `docs/*`

_When two sources disagree, the higher one wins. Quote both in the PR description and explain the choice._

## Forbidden actions (extracted from AGENTS.md for visibility)

- **Inventing file paths** that don't exist. STOP and ask.
- **Using forbidden vocabulary** (`AGENTS.md §4`).
- **Adding fields** to `/verify-card` response beyond the 5 allowed (§5).
- **Touching files** outside the prompt's "Files to add/modify" list.

**When in doubt: stop, ask, do not proceed.**

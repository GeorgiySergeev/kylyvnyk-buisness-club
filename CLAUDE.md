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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **kylyvnyk-buisness-club** (5628 symbols, 10947 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/kylyvnyk-buisness-club/context` | Codebase overview, check index freshness |
| `gitnexus://repo/kylyvnyk-buisness-club/clusters` | All functional areas |
| `gitnexus://repo/kylyvnyk-buisness-club/processes` | All execution flows |
| `gitnexus://repo/kylyvnyk-buisness-club/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

---
name: pr-comments-copilot-evolve
description: Export PR review comments for the current branch, filter out bot noise, and evolve .github/copilot-instructions.md with only durable, generic project rules. Use when asked to analyze PR comments, distill reviewer feedback into policy, or keep Copilot instructions lean.
---

Use this skill to turn human PR review feedback into a smaller, better `.github/copilot-instructions.md`.

## Export step

Always refresh the report before analyzing. Detect the current branch and derive the output path from it:

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SLUG=$(echo "$BRANCH" | tr '/' '-')
npm run pr:comments:export -- --head "$BRANCH" --output "reports/${SLUG}-comments.md" --exclude-authors 'vercel[bot],copilot-pull-request-reviewer[bot]'
```

Notes:

- Vercel deployment comments and Copilot review comments are excluded by default via `--exclude-authors`.
- Work from the freshly exported `reports/<slug>-comments.md`, not from memory.
- If the export fails, report the error and stop — do not analyze stale data.

## Inputs

- `.github/copilot-instructions.md` — policy to evolve; read before editing to avoid duplicates
- `AGENTS.md` — entry point for all project rules; follow its progressive disclosure to specific docs only when a comment requires it
- `reports/<slug>-comments.md` — freshly exported human PR comments; sole source for candidate rules

## Engineering analysis

Read each comment as a professional engineer. Ask: _would ignoring this pattern cause recurring issues across future PRs in this codebase?_

Promote a comment to a generic rule only when **all** of the following hold:

- It describes a structural, architectural, or contract violation — not a one-off stylistic preference.
- It generalizes beyond the specific file, function, or PR where it appeared.
- It aligns with, extends, or closes a gap in `AGENTS.md` or `docs/agents/*`.
- It can be written without referencing a specific PR, branch, file path, or temporary workaround.
- It would prevent the same class of mistake from being repeated by a future contributor or AI assistant.

**Reject or ignore** a comment when it is:

- Vague (`?`, unclear intent, or single-word reaction).
- A naming or formatting nit already covered by ESLint, Prettier, TypeScript, or Steiger.
- Specific to a temporary state of this PR that will not recur.
- An implementation suggestion that does not imply a stable repository rule.
- Already captured in the current `.github/copilot-instructions.md`.

## Update rules

When editing `.github/copilot-instructions.md`:

- **Keep it short.** Merge overlapping bullets, delete superseded rules, and cut duplication.
- Prefer a pointer to `AGENTS.md` or `docs/agents/*` over copying large rule lists inline.
- Frame rules in repository terms, not PR-specific examples.
- Maintain focus on: FSD boundaries, data flow, query/mutation contracts, form handling, i18n keys, env access, and design-system usage.
- Do not encode issue-specific bugs unless they clearly generalize into a durable pattern.
- Do not fix the PR itself as part of this skill — policy only.

## Output

Make exactly two changes:

1. Update `.github/copilot-instructions.md` with the minimal durable rule delta.
2. Keep the filtered export at `reports/<slug>-comments.md` as evidence.

In the final response, summarize:

- Which comments became generic rules and why.
- Which comments were excluded and the reason for each exclusion category.
- How the Copilot policy changed (shorter / clearer / new rule added).

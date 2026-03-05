# Agent Docs

This directory is the canonical source for agent-facing engineering rules in `lp-front`.

Use this map for targeted context loading:

- `docs/agents/architecture.md` - FSD boundaries, import/export policy, entity modeling, React Query + Zustand standards, i18n and auth routing rules.
- `docs/agents/forms.md` - Forms stack (RHF + Zod + Chakra v3), file layout, lifecycle, and do/don't conventions.
- `docs/agents/contributing.md` - Development setup, code style, naming, commit conventions, and PR process.
- `docs/agents/testing.md` - Testing strategy, E2E directory contract, selector policy, and Playwright runtime rules.

Priority rule:

- `AGENTS.md` is the root entrypoint/router for agents.
- Detailed rules and source-of-truth guidance live in `docs/agents/*`.

Out of scope:

- `.github/copilot-instructions.md` remains a separate PR review policy for GitHub review context.

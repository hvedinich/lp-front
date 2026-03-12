# Copilot PR Review Policy

Applies to pull request review only.

Review against project rules in `AGENTS.md` — it routes to specific docs per topic. Flag violations by citing the broken rule, not by suggesting rewrites. Focus on architecture, correctness, data flow, forms, i18n, env, and design-system contracts.

## High-Signal Violations

- FSD boundary break, deep import bypassing a barrel, or business/domain code leaking into `shared/`
- `pages/*.tsx` router file that does more than the standard `dynamic(..., { ssr: false, loading: () => <PageSpinner /> })` wrapper
- New `entities/*` slice for vendor/provider helpers that are not stable business entities
- Page-only schemas, defaults, form values, or form mappers moved out of `src/pages/*` before real reuse exists
- `useQuery` / `useMutation` defined in pages, widgets, or shared; raw API usage outside entity/feature model; `invalidateQueries` outside entity/feature hooks; inline query keys; direct `fetch` outside `apiRequest()`
- Custom query/mutation hooks that skip the shared `QueryHookOptions` / `MutationHookOptions` object contract
- Repeated manual query-string assembly around `apiRequest()` when shared query support should be used instead
- Direct `process.env.*` access instead of the shared env contract
- Submit handlers that swallow errors instead of rethrowing, or branched flows that still validate inactive fields
- Hardcoded validation messages, missing locale keys in any of `public/locales/{en,ru,pl}/common.json`, or duplicated generic copy instead of `commonActions.*` / `commonFeedback.*`
- Reusable components without root style passthrough, raw token or surface composition in JSX, interactive states in JSX, or bespoke controls where Chakra v3 already provides a primitive
- Local-only agent/editor config files, `*_PLAN.md`, non-English source comments, or unnecessary `as const` on already-literal values

## Skip Or Downgrade

- Style or formatting issues enforced by ESLint, Prettier, or Steiger — skip unless the diff explicitly disables or bypasses that tooling
- One-off implementation nits that do not generalize into a repository rule — downgrade to an optional note, do not block the PR
- Feature-level `setQueryData` used for synchronous orchestration — allowed pattern, not a violation

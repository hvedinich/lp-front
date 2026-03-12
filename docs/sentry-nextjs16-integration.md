# Sentry Integration Plan for Next.js 16 Pages Router

## Summary

Integrate `@sentry/nextjs` manually for browser, server, and edge in the Next.js 16 Pages Router app deployed on Vercel.

The primary requirement is reliable sourcemap upload during `next build` so both `staging` and `production` events are de-minified in Sentry. The integration must be enabled only for `staging` and `production`, disabled for `local` and `preview`, and controlled by explicit Sentry environment variables rather than inferred only from `VERCEL_ENV`.

This plan follows the current Sentry manual setup shape for Next.js with these deliberate scope constraints:

- no App Router setup
- no `sendDefaultPii`
- no Replay in v1
- no Logs in v1
- no `tunnelRoute` in v1
- no `widenClientFileUpload` unless a real gap is proven
- no custom sourcemap hacks up front

The plan is split into phases so different agents can implement them independently with clear handoff boundaries.

## Phase 0. Alignment And Contracts

Status: completed

### Goal

Freeze the integration contract before touching runtime files so later phases do not invent incompatible env or release logic.

### Scope

- Confirm the integration target is Pages Router only.
- Keep migration from [next.config.mjs](/Users/kuh_st/Code/localprof/lp-front/next.config.mjs) to `next.config.ts` as an explicit repository decision.
- Freeze env naming, release naming, runtime enablement rules, and v1 exclusions.

### Deliverables

- Final env contract for runtime and build.
- Final release contract shared by build and runtime.
- Explicit statement that v1 excludes Replay, Logs, and `tunnelRoute`.
- Explicit statement that the client init file will be `instrumentation-client.ts`.

### Notes For The Implementer

- `instrumentation-client.ts` is the chosen target even though some Pages Router docs still mention `sentry.client.config.ts`.
- This is a repo decision to remove ambiguity between older and newer Sentry setup examples.
- Migration to `next.config.ts` is not required by Sentry itself, but it remains part of this repository plan.

## Phase 1. Build Integration And Release Wiring

Status: completed

### Goal

Make `next build` upload sourcemaps correctly and ensure runtime events use the same release identifier as the uploaded artifacts.

### Scope

- Install `@sentry/nextjs`.
- Migrate [next.config.mjs](/Users/kuh_st/Code/localprof/lp-front/next.config.mjs) to `next.config.ts`.
- Wrap the Next config with `withSentryConfig(...)`.
- Add build-only Sentry config outside `src`, for example in `config/sentry/build.ts`, with no barrel export.
- Add pure shared helpers for release and build option derivation:
  - `resolveSentryRuntimeMode(...)`
  - `buildSentryRelease(...)`
  - `getSentryBuildOptions(...)`

### Release Policy

- Use one release format across build and runtime:
  - `lp@<git-sha>-staging`
  - `lp@<git-sha>-production`
- Keep staging and production artifact sets distinct through distinct release values.
- Do not fall back to a single shared release for both environments.

### Why Release Must Stay Environment-Specific

- The repo already uses environment-dependent `NEXT_PUBLIC_*` variables.
- Even on the same commit SHA, staging and production can produce different client artifacts.
- A shared release would make sourcemap-to-artifact matching ambiguous.

### Build Environment Contract

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE_SHA` optional

### Git SHA Fallback Order

- `SENTRY_RELEASE_SHA`
- `VERCEL_GIT_COMMIT_SHA`
- `GIT_COMMIT_SHA`

### Build Validation Rules

- If build-time upload is enabled, build config must fail fast when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, or release SHA cannot be resolved.
- Do not disable sourcemap upload.
- Do not enable `widenClientFileUpload` in v1.

### Handoff Output

- `next.config.ts` wrapped with `withSentryConfig(...)`
- extracted pure build helpers
- final release derivation shared with runtime phases

## Phase 2. Runtime Bootstrapping Across Browser, Server, And Edge

Status: completed

### Goal

Initialize Sentry correctly in all supported runtimes while keeping runtime config minimal, DRY, and environment-gated.

### Scope

- Add the standard runtime files:
  - `instrumentation-client.ts`
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
  - `instrumentation.ts`
- Keep shared env contracts inside `src/shared/config/env/*` and runtime integration inside `src/application/sentry/*`.
- Add pure runtime helpers:
  - `resolveSentryRuntimeMode(...)`
  - `buildSentryRelease(...)`
  - `getSentryRuntimeOptions(...)`

### Runtime Rules

- local development: disabled by default
- preview: disabled
- staging: enabled with `environment=staging`
- production: enabled with `environment=production`

### Public Runtime Env Vars

- `NEXT_PUBLIC_SENTRY_ENABLED`
- `NEXT_PUBLIC_SENTRY_ENV`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` optional

### Server And Edge Runtime Env Vars

- `SENTRY_DSN`

### Runtime Validation Rules

- If Sentry is disabled, missing Sentry vars must not fail local or preview flows.
- If Sentry is enabled, runtime must fail fast when the required DSN or environment contract is missing or invalid.
- `NEXT_PUBLIC_SENTRY_ENV` must allow only `staging` or `production` when Sentry is enabled.
- `VERCEL_ENV` may be used only as a secondary guard or sanity check, not as the primary source of truth.
- Browser/public env reads must use explicit direct `process.env.NEXT_PUBLIC_*` access so Next.js can inline them into the client bundle.

### Runtime Configuration Rules

- Keep one base runtime-options builder for `enabled`, `environment`, `release`, `dsn`, `tracesSampleRate`, and filtering.
- Use thin client/server/edge wrappers over the shared builder.
- Keep tracing minimal:
  - enable basic tracing only
  - default `tracesSampleRate` to a low explicit baseline such as `0.1`
  - allow env override if needed later
- Keep filtering minimal and cheap:
  - ignore obvious browser extension noise such as `chrome-extension://` and `moz-extension://`
  - ignore explicitly cancelled or aborted client noise when it is non-actionable
  - avoid a heavy `beforeSend` pipeline or broad message-based heuristics in v1

### Explicit Exclusions

- no Replay
- no Logs
- no `tunnelRoute`
- no `sendDefaultPii`

### Handoff Output

- all runtime init files in place
- shared runtime builder logic
- runtime env validation behavior locked

## Phase 3. Pages Router Error Capture Wiring

Status: completed

### Goal

Capture Pages Router errors using the current Sentry-recommended hooks without adding extra app-specific behavior.

### Scope

- Implement `instrumentation.ts` runtime registration.
- Export `onRequestError = Sentry.captureRequestError`.
- Add `pages/_error.tsx`.

### Implementation Rules

- In `instrumentation.ts`:
  - register the correct runtime config depending on runtime
  - import `sentry.server.config.ts` only for `nodejs`
  - import `sentry.edge.config.ts` only for `edge`
  - export `onRequestError = Sentry.captureRequestError`
- In `pages/_error.tsx`:
  - implement the Pages Router pattern using `captureUnderscoreErrorException(ctx)` inside `getInitialProps`
  - keep the page thin and aligned with the official Sentry Pages Router guidance
  - do not add unrelated custom UI or product behavior

### Error Capture Rules

- Do not add global `captureException` in React Query `QueryCache` or `MutationCache`.
- Add manual `captureException(...)` only for paths that are truly swallowed and would not reach Sentry automatically.

### Handoff Output

- `instrumentation.ts` wired for request errors
- `pages/_error.tsx` wired for SSR and page-level failures
- no accidental duplicate-reporting layer introduced

## Phase 4. Tests And Static Verification

Status: completed

### Goal

Prove the integration logic is deterministic before deployment and make regressions cheap to detect.

### Scope

- Add table-driven Vitest coverage for:
  - local / preview / staging / production enablement matrix
  - conditional env validation for disabled vs enabled Sentry
  - release derivation and git SHA fallback order
  - build-time gating for upload options
- Add targeted tests for:
  - `instrumentation.ts` runtime branching
  - `pages/_error.tsx` Sentry wiring via `captureUnderscoreErrorException`
  - runtime option builder behavior for client/server/edge

### Test Strategy Rules

- Keep `next.config.ts` thin and test extracted pure helpers rather than heavy config mocking.
- Prefer table-driven coverage for env and release logic.
- Avoid snapshot-heavy tests when direct assertions on helpers are sufficient.

### Quality Gate

Run exactly in this order after implementation:

```bash
npm run fix
npm run validate
```

`npm run validate` must exit `0`.

### Handoff Output

- passing focused Sentry tests
- passing repository quality gate

## Phase 5. Deployment Verification In Sentry

Status: pending

### Goal

Validate that the integration works in a real deployed environment, not just in unit tests.

### Scope

- Deploy to `staging`.
- Trigger one controlled test error after deployment.
- Verify event ingestion, sourcemap de-minification, and trace visibility in Sentry.
- Remove the temporary trigger after verification.

### Verification Checklist

- The test error appears in Sentry `Issues`.
- The stack trace is de-minified and references readable source locations.
- The event uses the expected `environment=staging`.
- The event uses the expected release naming scheme.
- A trace appears in Sentry `Traces`.

### Verification Rules

- This manual verification is mandatory for rollout readiness.
- Internal tests alone are not sufficient to close the integration.
- No external Sentry API automation is required in v1.

### Handoff Output

- confirmation that staging integration works end-to-end
- confirmation that sourcemaps match the uploaded release

## Phase 6. PR And Rollout Notes

Status: pending

### Goal

Make the rollout understandable for reviewers and future maintainers.

### PR Notes Must State

- that sourcemaps are uploaded during `next build` via `withSentryConfig(...)`
- which env vars must exist in Vercel for staging and production
- which release naming scheme is used
- that preview deployments keep Sentry disabled
- that v1 intentionally excludes Replay, Logs, `tunnelRoute`, and `widenClientFileUpload`

### Assumptions

- A single Sentry project is used for the frontend.
- `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` may hold the same DSN value, but the variable names stay separated to match Sentry's recommended client vs server configuration shape.
- `staging` and `production` are distinct deployment artifact sets and must never share a release value.
- The app name used in release naming remains `lp` unless the repository naming contract changes.

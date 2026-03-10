# Testing Guide

## Goals

- Keep fast feedback with focused unit tests.
- Validate end-to-end user flows with Playwright.
- Keep test ownership clear by layer.

## Test layers

- `Vitest` (`npm run test`): co-located unit/module tests in `src/**` (`*.test.ts`).
- `Playwright` (`npm run test:e2e`): cross-slice E2E scenarios in `e2e/**`.
- Page-level integration tests live in `src/pages/<slice>/integration/**` and cover orchestration that is expensive to duplicate in E2E.
- Auth/session guard rules belong in small Vitest tests around pure state resolvers; cover both redirect-safe transitions and background `/auth/me` refresh without a full-page loader.

## E2E directory contract

| Path                       | Responsibility                                                                   |
| -------------------------- | -------------------------------------------------------------------------------- |
| `e2e/specs/**`             | Test scenarios and assertions only                                               |
| `e2e/fixtures/**`          | Lifecycle and reusable test fixtures (`test`, `expect`, auth/session/data setup) |
| `e2e/support/api/**`       | Backend setup/teardown helpers (typed API calls)                                 |
| `e2e/support/builders/**`  | Test data builders and naming helpers                                            |
| `e2e/support/helpers/**`   | Shared small utilities (selectors, routes, session helpers)                      |
| `e2e/support/contracts/**` | Shared E2E types/contracts                                                       |
| `e2e/storage/**`           | Reserved for optional/manual artifacts (`.gitkeep` only by default)              |

## Artifact policy

- Standard Playwright runtime artifacts must live only in `test-results/` and `playwright-report/`.
- Both directories are ignored by Git and must remain untracked.
- `testInfo.attach(...)` attachments, traces, screenshots, and videos must use Playwright's built-in output flow instead of writing files into tracked `e2e/**` paths.
- Do not save debug dumps next to specs, fixtures, or helpers.
- Keep `e2e/artifacts/.gitkeep` only; specs and fixtures must not write runtime files into `e2e/artifacts/**`.

## Naming and import rules

- Spec naming: `<domain>.<flow>.spec.ts`.
- Fixture naming: `<domain>.fixture.ts`.
- API helper naming: `<domain>.api.ts`.
- Specs import from:
  - `e2e/fixtures/test`
  - `e2e/support/helpers/*`
- Do not create monolithic helper files like a single `backend.ts`.

## Selector policy

- Default priority: `getByRole` -> `getByLabel` -> `getByText` / `getByPlaceholder` -> `getByTestId`.
- Prefer locators that match what the user sees and interacts with.
- Use `data-testid` only as a fallback when UI meaning is not safely expressible through accessible text/roles, or when localization would make semantic locators brittle.
- Keep any remaining test IDs semantic and stable.

## Real backend mode

- E2E runs against a real backend (no network mocks in Playwright specs).
- Setup/cleanup calls use `APIRequestContext` helpers (not browser `evaluate(fetch)`).
- API request paths are adaptive:
  - same-origin relative paths when app and API share origin
  - absolute `NEXT_PUBLIC_API_URL` when API origin is separate
- Auth bootstrap:
  - run `auth` specs in a dedicated narrow lane; keep product E2E on a separate app lane
  - ensure one deterministic app E2E user per deployment scope and Playwright worker (`PLAYWRIGHT_E2E_SCOPE` + worker index)
  - local runs without `PLAYWRIGHT_E2E_SCOPE` fall back to an ephemeral run scope to avoid reusing broken users from older staging sessions
  - treat `/auth/register` `409` as "user already exists" only if login with current credentials still succeeds
  - authenticate only in shared bootstrap/fixture layers; specs must not call raw login helpers directly
  - transient 5xx auth bootstrap failures use bounded retry with backoff+jitter
  - `/auth/login` is serialized and treated as a scarce resource; long retry-after responses fail fast instead of blocking fixture setup
  - negative auth UI test uses isolated invalid credentials and does not call user bootstrap
- Feature specs use one worker-scoped app session and test-scoped data cleanup to avoid repeating full auth bootstrap in each scenario.
- Cached `storageState` files in `e2e/storage/*.json` are reused only while they still pass `/auth/me`.
- If cached storage state is invalid, the fixture re-authenticates and refreshes the file before the scenario continues.
- Any E2E user created for a scenario must be deleted in fixture teardown regardless of test outcome; rely on backend cascade cleanup instead of manual per-entity cleanup for that user.
- Final E2E user cleanup also runs in Playwright `globalSetup` / `globalTeardown` as a best-effort sweep for leftovers from interrupted runs.

## Playwright app lifecycle

- Local mode (`CI=false`):
  - `baseURL` is `http://localhost:${PORT}`
  - reuse running server on this URL if available
  - otherwise start `npm run dev`
  - process started by Playwright is stopped after run
- CI mode (`CI=true`):
  - `webServer` is disabled
  - target deployed URL comes from `PLAYWRIGHT_BASE_URL`
  - missing `PLAYWRIGHT_BASE_URL` is treated as a configuration error
  - local URLs are rejected in CI

## Parallelism policy

- `fullyParallel=true`.
- Local run: `workers=2` by default.
- Optional local override: set `PLAYWRIGHT_WORKERS` (for example `PLAYWRIGHT_WORKERS=4 npm run test:e2e`) when backend capacity allows.
- CI run: app lane uses `workers=4`, retries enabled; auth lane stays narrow.
- Use per-test data isolation (`testId` prefixes) and fixture-managed auth state to keep runs parallel-safe.
- `auth` scenarios run in a dedicated narrow lane and should stay few and expensive.
- Stateful `locations` / `devices` scenarios may keep narrow serialization while product state is still not fully parallel-safe. Treat this as a temporary infrastructure compromise, not a testing ideal.

## Spec structure

- Specs should read as user scenarios: action -> visible result.
- Keep repeated setup and screen interactions in small screen/domain actions, not in monolithic page objects.
- Specs own the business narrative and assertions; fixtures own auth/session/bootstrap; API helpers own backend setup/cleanup.
- Do not use `page.waitForTimeout()` in specs. If transient infrastructure handling is required, keep it in a focused helper with a documented reason.

## Commands

```bash
# Unit/module tests
npm run test

# E2E tests
npm run test:e2e

# E2E debug run with rich failure artifacts
npm run test:e2e:debug

# Interactive E2E runner
npm run test:e2e:ui

# Open the latest Playwright HTML report
npm run test:e2e:report
```

## Debug workflow

- Use `npm run test:e2e` for the regular fast run.
- If a test fails, rerun only the relevant scope with `npm run test:e2e:debug -- <spec-or-filter>`.
- Debug mode stores traces, screenshots, videos, and JSON attachments in `test-results/` and renders HTML reports in `playwright-report/` lane folders.
- The first place to inspect is the `failure-context` JSON attachment in the HTML report; use trace viewer only after the attachment summary is not enough.

## Required env for E2E

- `PORT`
- `NEXT_PUBLIC_API_URL`
- `PLAYWRIGHT_DEBUG_ARTIFACTS` (optional debug mode flag used by `npm run test:e2e:debug`)
- `PLAYWRIGHT_BASE_URL` (required in CI)
- `PLAYWRIGHT_E2E_SCOPE` (optional locally, set in CI from deployment ref)
- `NEXT_PUBLIC_SITE_URL` (optional)
- `NEXT_PUBLIC_VERCEL_URL` / `VERCEL_URL` (optional outside CI)
- `PLAYWRIGHT_E2E_EMAIL`
- `PLAYWRIGHT_E2E_PASSWORD`
- `PLAYWRIGHT_WORKERS` (optional local override)

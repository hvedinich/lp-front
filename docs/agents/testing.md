# Testing Guide

## Goals

- Keep fast feedback with focused unit tests.
- Validate end-to-end user flows with Playwright.
- Keep test ownership clear by layer.

## Test layers

- `Vitest` (`npm run test`): co-located unit/module tests in `src/**` (`*.test.ts`).
- `Playwright` (`npm run test:e2e`): cross-slice E2E scenarios in `e2e/**`.
- Page-level integration tests live in `src/pages/<slice>/integration/**` and cover orchestration that is expensive to duplicate in E2E.

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
| `e2e/artifacts/**`         | Optional manually collected E2E artifacts                                        |

## Naming and import rules

- Spec naming: `<domain>.<flow>.spec.ts`.
- Fixture naming: `<domain>.fixture.ts`.
- API helper naming: `<domain>.api.ts`.
- Specs import from:
  - `e2e/fixtures/test`
  - `e2e/support/helpers/*`
- Do not create monolithic helper files like a single `backend.ts`.

## Selector policy

- Default: `data-testid` for stable business-critical elements.
- Keep IDs semantic and stable.
- Avoid text-based selectors for localized UI when a `data-testid` is available.

## Real backend mode

- E2E runs against a real backend (no network mocks in Playwright specs).
- Setup/cleanup calls use `APIRequestContext` helpers (not browser `evaluate(fetch)`).
- API request paths are adaptive:
  - same-origin relative paths when app and API share origin
  - absolute `NEXT_PUBLIC_API_URL` when API origin is separate
- Auth bootstrap:
  - ensure user exists (register/409 path) without extra login calls
  - authenticate only where session is required (worker fixture/session bootstrap)
  - transient 5xx auth bootstrap failures use bounded retry with backoff+jitter
  - `/auth/login` handles `RATE_LIMITED` with retry-after wait and serialized login attempts
  - negative auth UI test uses isolated invalid credentials and does not call user bootstrap
- Feature specs (`locations`) use worker-level `storageState` to avoid repeating full auth bootstrap in each test.
- Worker `storageState` files are reused from `e2e/storage/*.json` across runs when still valid (`/auth/me` check).
- If cached storage state is invalid, fixture re-authenticates and refreshes the file.

## Playwright app lifecycle

- Local mode (`CI=false`):
  - `baseURL` is `http://localhost:${PORT}`
  - reuse running server on this URL if available
  - otherwise start `npm run dev`
  - process started by Playwright is stopped after run
- CI mode (`CI=true`):
  - `webServer` is disabled
  - target deployed URL comes from `PLAYWRIGHT_BASE_URL`
  - local URLs are rejected in CI

## Parallelism policy

- `fullyParallel=true`.
- Local run: `workers=2` by default.
- Optional local override: set `PLAYWRIGHT_WORKERS` (for example `PLAYWRIGHT_WORKERS=4 npm run test:e2e`) when backend capacity allows.
- CI run: `workers=4`, retries enabled.
- Use per-test data isolation (`testId` prefixes) and worker-scoped auth state to keep runs parallel-safe.

## Commands

```bash
# Unit/module tests
npm run test

# E2E tests
npm run test:e2e

# Interactive E2E runner
npm run test:e2e:ui
```

## Required env for E2E

- `PORT`
- `NEXT_PUBLIC_API_URL`
- `PLAYWRIGHT_BASE_URL` (required in CI)
- `NEXT_PUBLIC_SITE_URL` (optional)
- `NEXT_PUBLIC_VERCEL_URL` / `VERCEL_URL` (optional outside CI)
- `PLAYWRIGHT_E2E_EMAIL`
- `PLAYWRIGHT_E2E_PASSWORD`
- `PLAYWRIGHT_WORKERS` (optional local override)

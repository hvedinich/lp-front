# LP Application Architecture Rules

## 1. Scope

This document defines architecture rules for the LP application:

- Feature-Sliced Design (FSD) layer boundaries
- import/export policy
- entity modeling policy
- React Query server-state standard
- Zustand client-state standard

This file is a ruleset, not a product specification.

## 2. Architecture Model (FSD)

The project follows a page-first FSD approach:

- keep page-specific logic in `pages` slices first
- extract code to lower layers only when it is reused or truly generic
- keep page components composition-first and minimal:
  - render structure only (header, actions, list/table, modal, empty state)
  - avoid heavy orchestration logic inline
  - move orchestration to `pages/*/model` controller hooks
  - move presentational blocks to `pages/*/ui/*`

Layers:

- `application` - global bootstrap (providers, app wiring, global styles)
- `pages` - page slices and page composition
- `widgets` - large UI blocks composed from features/entities
- `features` - user scenarios/use-cases
- `entities` - business entities, cross-entity contracts, and entity-level data access
- `shared` - framework-agnostic/common foundation

## 3. Layer Dependency Rules

Allowed dependencies:

- `application` -> `pages`, `widgets`, `features`, `entities`, `shared`
- `pages` -> `widgets`, `features`, `entities`, `shared`
- `widgets` -> `features`, `entities`, `shared`
- `features` -> `entities`, `shared`
- `entities` -> `entities` (only via `entities/contracts/index.ts`), `shared`
- `shared` -> `shared`

Forbidden:

- upward imports (from a lower layer to a higher layer)
- cross-slice deep imports through internal files
- `features`, `widgets`, `pages` importing directly from `entities/contracts` (must go through the owning entity's `index.ts`)

## 4. Slice Structure

Recommended slice structure:

```txt
<layer>/<slice>/
  ui/
  model/
  api/
  lib/
  index.ts
```

The `entities` layer has one additional reserved slice: `entities/contracts/`. See section 7.1.

Rules:

- use relative imports only inside the same slice
- use alias imports (`@/...`) for cross-slice imports

## 5. Import Policy

### 5.1 Public API only

Cross-slice imports must use slice public API (`index.ts`).

Valid:

```ts
import { useReviewsQuery } from '@/entities/review';
```

Invalid:

```ts
import { useReviewsQuery } from '@/entities/review/model/useReviewsQuery';
```

### 5.2 No layer leakage

- `features` must not import from `widgets` or `pages`
- `entities` must not import from `features`, `widgets`, or `pages`
- `shared` must not import domain-level code

### 5.3 Module Barrels (Mandatory)

Each module must expose a public API through `index.ts`, and cross-module imports must use only that barrel.

Allowed:

```ts
import { useAuthGuard } from '@/shared/hooks';
```

Forbidden:

```ts
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
```

Rules:

- do not import directly from internal files of another module
- each module defines what is public in its own `index.ts`
- internal files are private by default

## 6. Export Policy

Each slice exposes a stable external contract in `index.ts`.

Do:

- export only what other slices should consume
- keep internal files private by default

Do not:

- use wildcard exports from internal subfolders without intent
- expose unstable implementation details

## 7. Entity Rules

In this repository, an entity includes:

- domain types
- API DTO contracts
- DTO-to-domain mapping
- entity query keys
- entity-level query/mutation hooks

Entity public API rules:

- entities must expose React Query hooks from `index.ts` (not raw transport functions)
- pages/features/widgets must consume entity hooks, not direct `api/*` functions; exception: a pages/features/widgets slice may call `api/*` functions directly when the logic is specific to that slice and is not reused elsewhere
- mutation usage style is hook-first, for example: `const { mutate: loginUser } = useLoginUser()`

Recommended entity layout:

```txt
src/entities/review/
  api/
    review.api.ts
    review.dto.ts
  model/
    review.types.ts
    review.query-keys.ts
    useReviewsQuery.ts
    useUpdateReviewMutation.ts
  lib/
    review.mapper.ts
  index.ts
```

## 7.1 Cross-Entity Contracts

Some types and query keys are domain-specific (cannot go in `shared`) but must be shared across multiple entity slices. The `entities/contracts/` slice is the designated location for these.

Structure:

```txt
src/entities/contracts/
  index.ts        ← barrel (re-exports only, same purity rules as all index.ts)
  types.ts        ← cross-entity domain types
  queryKeys.ts    ← shared query key fragments (if any)
```

Rules:

- `entities/contracts` is a **leaf node**: it must not import from any other entity slice
- entity slices may import from `@/entities/contracts` through its `index.ts`
- `features`, `widgets`, and `pages` must **not** import from `@/entities/contracts` directly; they access these types through the owning entity's `index.ts` (which re-exports what higher layers need)
- only put a type or query key in `contracts` if it is needed by two or more entity slices; otherwise it belongs in the owning entity

## 8. Data Access Standard (React Query)

All server data access must be implemented with `@tanstack/react-query`.

Mandatory rules:

- no direct `fetch`/`axios` calls from page/widget UI components
- define query keys per entity
- keep `queryFn`/`mutationFn` close to entity API
- use invalidate/update patterns via entity query keys
- mutation-driven UI side effects (toasts, redirects, tracking) must use mutation callbacks (`onError`/`onSuccess`), not `useEffect` over mutation error state
- query UI side effects must use component-level `useEffect` (React Query v5 query callbacks are removed)
- entity query hooks (`entities/*/model/use*.ts`) must stay UI-pure (no toast/dialog/navigation side effects)
- QueryClient global query handlers are infrastructure-only (telemetry/logging) unless explicitly overridden by feature policy
- mutation hooks must use single object options API:
  - `useMutationHook({ scope, options })`
  - `scope` carries mutation infrastructure context (for example `accountId`)
  - hooks without domain scope must still pass `scope: {}` to keep the contract uniform
  - `options` uses `MutationOptions<...>` for lifecycle handlers and UI side effects
  - new code must not use positional signatures like `(accountId, options?)`

Layer usage:

- `entities`: base query/mutation hooks
- `features`: workflow orchestration and side effects
- `pages/widgets`: composition and UI wiring only; exception: a page or widget slice may define a `useMutation` directly when the mutation logic is specific to that slice and is not reused elsewhere

## 8.1 Client State Standard (Zustand)

All client-only state must be implemented with `zustand`.

Mandatory rules:

- `zustand` stores only client state (selected IDs, UI flags, hydration/meta state)
- React Query stores only server state (lists/details returned from backend)
- do not duplicate server collections from React Query into `zustand`
- components must subscribe with selectors, not read the whole store object

Store placement:

- `shared/store/core/*`: store infrastructure only (factory, middleware wiring, persist helpers)
- `entities/*/model/store/*`: domain slice state, selectors, and actions
- `widgets/*/model/store/*`: widget-scoped UI state slices (layout/view state), when not domain entity state
- `application/*`: app-level store composition/provider wiring

Hydration and persistence:

- persist only stable client state needed across reloads
- include explicit hydration readiness flags for deterministic UI bootstrap
- persist only validated values (for example, selected IDs that exist in current domain data)

Cross-module lifecycle:

- account/session changes must reset account-scoped slices
- query cache invalidation and store reset must be coordinated in one protocol

## 9. DTO and Domain Mapping

Rules:

- API DTO types live in `entity/api/*.dto.ts`
- UI and features consume domain models, not raw DTOs
- mapping happens in `entity/lib/*mapper.ts`

## 10. Shared Layer Rules

`shared` contains only cross-domain reusable code:

- `shared/api` - HTTP client, query client factory, transport helpers
- `shared/ui` - base UI primitives
  - render Lucide icons via `AppIcon` from `@/shared/ui`; icon glyphs may be imported directly from `lucide-react`
- `shared/lib` - generic utilities
- `shared/config` - reusable config primitives and browser-safe config exports
- `shared/types` - common non-domain types

No business rules in `shared`.

Ownership notes:

- `shared/config/env/*` owns env parsing helpers and runtime-specific env contracts
- `shared/config` common barrel must stay browser-safe by default
- `application/sentry/*` owns browser/server/edge Sentry runtime integration
- `shared/lib/sentry/*` may expose reusable capture helpers for lower layers
- build-time Sentry config may live outside `src/` under `config/`

## 11. Naming Rules

- page components: `*Page.tsx`
- hooks: `use<Entity><Action>`
- query key factories: `<entity>QueryKeys`
- slice folders: `kebab-case`
- public API entry: `index.ts`
- zustand slices: `<domain><Purpose>Slice.ts`
- selectors: expose as a namespaced object `<domain><Purpose>Selectors` (for example `locationSelectionSelectors`)
- store/domain functions: selectors `select*`, actions `set/reset/resolve/mark*`, mappers `map<Entity>Dto`

## 12. Definition of Done (Architecture)

A change is architecture-compliant only if:

- layer dependency rules are respected
- cross-slice imports use public API only
- entity data access uses React Query
- client-only state uses Zustand with selector-based subscriptions
- DTO/domain mapping is explicit
- no business logic is added to `shared`

## 13. Forms

Form architecture (React Hook Form + Zod + Chakra v3 wrappers) is defined in:

- `docs/agents/forms.md`

## 14. i18n and Text Rules

i18n stack:

- `i18next` + `react-i18next` (client-only)
- locales: `en` (default), `pl`, `ru`
- locale resources in `apps/lp/public/locales/<locale>/common.json`
- locale is not stored in URL
- locale selection is based on:
  - account language (when available)
  - local storage/browser language fallback

## 15. Auth Routing

Access policy:

- public routes: `/login`, `/signup`
- protected routes: all other routes

Behavior:

- protected routes are guarded in the application shell (`pages/_app.tsx`)
- auth check uses cookie-based session endpoint (`/auth/me`)
- unauthenticated users are redirected to `/login?next=<requested-path>`

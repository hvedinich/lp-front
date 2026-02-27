# LP Application Architecture Rules

## 1. Scope

This document defines architecture rules for the LP application:

- Feature-Sliced Design (FSD) layer boundaries
- import/export policy
- entity modeling policy
- React Query data-access standard

This file is a ruleset, not a product specification.

## 2. Architecture Model (FSD)

The project follows a page-first FSD approach:

- keep page-specific logic in `pages` slices first
- extract code to lower layers only when it is reused or truly generic

Layers:

- `app` - global bootstrap (providers, app wiring, global styles)
- `pages` - page slices and page composition
- `widgets` - large UI blocks composed from features/entities
- `features` - user scenarios/use-cases
- `entities` - business entities, contracts, and entity-level data access
- `shared` - framework-agnostic/common foundation

## 3. Layer Dependency Rules

Allowed dependencies:

- `app` -> `pages`, `widgets`, `features`, `entities`, `shared`
- `pages` -> `widgets`, `features`, `entities`, `shared`
- `widgets` -> `features`, `entities`, `shared`
- `features` -> `entities`, `shared`
- `entities` -> `shared`
- `shared` -> `shared`

Forbidden:

- upward imports (from a lower layer to a higher layer)
- cross-slice deep imports through internal files

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
- pages/features/widgets must consume entity hooks, not direct `api/*` functions
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

## 8. Data Access Standard (React Query)

All server data access must be implemented with `@tanstack/react-query`.

Mandatory rules:

- no direct `fetch`/`axios` calls from page/widget UI components
- define query keys per entity
- keep `queryFn`/`mutationFn` close to entity API
- use invalidate/update patterns via entity query keys

Layer usage:

- `entities`: base query/mutation hooks
- `features`: workflow orchestration and side effects
- `pages/widgets`: composition and UI wiring only

## 9. DTO and Domain Mapping

Rules:

- API DTO types live in `entity/api/*.dto.ts`
- UI and features consume domain models, not raw DTOs
- mapping happens in `entity/lib/*mapper.ts`

## 10. Shared Layer Rules

`shared` contains only cross-domain reusable code:

- `shared/api` - HTTP client, query client factory, transport helpers
- `shared/ui` - base UI primitives
- `shared/lib` - generic utilities
- `shared/config` - runtime config
- `shared/types` - common non-domain types

No business rules in `shared`.

## 11. Naming Rules

- page components: `*Page.tsx`
- hooks: `use<Entity><Action>`
- query key factories: `<entity>QueryKeys`
- slice folders: `kebab-case`
- public API entry: `index.ts`

## 12. Definition of Done (Architecture)

A change is architecture-compliant only if:

- layer dependency rules are respected
- cross-slice imports use public API only
- entity data access uses React Query
- DTO/domain mapping is explicit
- no business logic is added to `shared`

## 13. Forms

Form architecture (React Hook Form + Zod + Chakra v3 wrappers) is defined in:

- `apps/lp/FORMS_ARCHITECTURE.md`

## 14. i18n and Text Rules

i18n stack:

- `i18next` + `react-i18next` (client-only)
- locales: `en` (default), `pl`, `ru`
- locale resources in `apps/lp/public/locales/<locale>/common.json`
- locale is not stored in URL
- locale selection is based on:
  - account language (when available)
  - local storage/browser language fallback

Lint policy for untranslated UI text:

- `react/jsx-no-literals` is enabled in `apps/lp/eslint.config.mjs`

## 15. Auth Routing

Access policy:

- public routes: `/login`, `/signup`
- protected routes: all other routes

Behavior:

- protected routes are guarded in app shell (`pages/_app.tsx`)
- auth check uses cookie-based session endpoint (`/auth/me`)
- unauthenticated users are redirected to `/login?next=<requested-path>`

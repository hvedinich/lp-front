# Refactoring Plan

Agreed scope from architecture/code-quality review.
Every item has an explicit file list, step-by-step instructions, and a done-criterion so an AI agent can execute it without guessing.

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done
- **Layer**: FSD layer that owns the change
- **Effort**: rough estimate for a focused session

---

## Item 1 — Create `features/auth` slice · move `useLogoutUser` + `useAuthGuard`

**Status**: `[ ]`  
**Layer**: `features`  
**Effort**: ~45 min  
**Depends on**: Item 2 (redirect helper), Item 3 (guard race-condition fix)

### Why

- `useLogoutUser` lives in `entities/auth` but contains `useRouter` + routing side-effects — entities must be pure data-access.
- `useAuthGuard` lives in `widgets/mainLayout/model/` — cross-cutting auth orchestration does not belong to a single widget; it is not discoverable and cannot be reused by other widgets.
- Both hooks orchestrate user-scenarios (logout flow, authenticated-route enforcement) — that is the definition of a `features` slice.

### Steps

1. **Create directory** `src/features/auth/model/`

2. **Create** `src/features/auth/model/useLogoutUser.ts`
   - Copy logic from `src/entities/auth/model/useLogoutUser.ts`
   - Remove `useRouter` import and `router.replace('/login')` call
   - Add optional `onSettled?: () => void` parameter to the hook
   - In `onSettled` callback: call `queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })` (see Item 13E — unified approach), then call `options?.onSettled?.()` if provided
   - The entity consumer (`widgets/mainLayout/ui/MainSidebar.tsx`) will pass `onSettled: () => router.replace('/login')`

   ```ts
   // src/features/auth/model/useLogoutUser.ts
   interface UseLogoutUserOptions {
     onSettled?: () => void;
   }

   export const useLogoutUser = (options?: UseLogoutUserOptions) => {
     const queryClient = useQueryClient();
     return useMutation<void, Error, void>({
       mutationFn: logoutUser,
       onSettled: async () => {
         await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
         options?.onSettled?.();
       },
     });
   };
   ```

3. **Create** `src/features/auth/model/useAuthGuard.ts`
   - Move `resolveAuthGuardState` + `useAuthGuard` from `src/widgets/mainLayout/model/useAuthGuard.ts`
   - Apply Item 13E fix: add `isSessionFetching` input to `resolveAuthGuardState` (see Item 3 details below)
   - Use `buildLoginRedirect` helper from `shared/config/routes` (see Item 2)

4. **Create** `src/features/auth/model/useAuthGuard.test.ts`
   - Move test file from `src/widgets/mainLayout/model/useAuthGuard.test.ts`
   - Update import path
   - Add new test cases from Item 3 (isFetching coverage)

5. **Create barrel** `src/features/auth/index.ts`

   ```ts
   export { useLogoutUser } from './model/useLogoutUser';
   export { useAuthGuard, resolveAuthGuardState } from './model/useAuthGuard';
   ```

6. **Update consumers**:
   - `src/widgets/mainLayout/ui/MainSidebar.tsx` — change import from `@/entities/auth` to `@/features/auth`; pass `onSettled: () => router.replace('/login')` to `useLogoutUser`
   - `src/widgets/mainLayout/ui/MainPageLayout.tsx` — change import from `../model/useAuthGuard` to `@/features/auth`

7. **Delete** old files:
   - `src/entities/auth/model/useLogoutUser.ts`
   - `src/widgets/mainLayout/model/useAuthGuard.ts`
   - `src/widgets/mainLayout/model/useAuthGuard.test.ts`

8. **Update** `src/entities/auth/index.ts` — remove `useLogoutUser` export

9. **Update** `src/widgets/mainLayout/index.ts` — remove any `useAuthGuard`/`resolveAuthGuardState` exports if present

### Done criterion

`npm run validate` exits 0. No import from `entities/auth` points to a routing hook. No import from `widgets/mainLayout` points to auth logic.

---

## Item 2 — Consolidate redirect-URL building into `shared/config/routes`

**Status**: `[x]`  
**Layer**: `shared`  
**Effort**: ~20 min  
**Depends on**: nothing

### Why

`getLoginRedirectTarget` exists in `src/shared/api/client.ts` (lines 67–79) but `useAuthGuard` in `widgets/mainLayout` independently constructs `/login?next=${encodeURIComponent(...)}` without using it. Two implementations of the same logic → DRY violation and potential divergence.

### Steps

1. **Move** `getLoginRedirectTarget` from `src/shared/api/client.ts` to `src/shared/config/routes.ts`
   - Rename to `buildLoginRedirect` for clarity (takes `currentPath: string`, returns `string | null`)
   - Keep identical implementation

2. **Re-export** `buildLoginRedirect` from `src/shared/config/index.ts`

3. **Update** `src/shared/api/client.ts`:
   - Remove `getLoginRedirectTarget` function
   - Import `buildLoginRedirect` from `@/shared/config`
   - Use it inside `redirectToLogin()`

4. **Update** `src/shared/api/index.ts`:
   - Remove `getLoginRedirectTarget` from public exports (it was never in the barrel — confirm)

5. **Update** `src/shared/api/client.test.ts`:
   - Update test import to use `buildLoginRedirect` from `@/shared/config`
   - OR move those tests to a new `src/shared/config/routes.test.ts`

6. **Update** `src/features/auth/model/useAuthGuard.ts` (created in Item 1):
   - Import `buildLoginRedirect` from `@/shared/config`
   - Replace inline `encodeURIComponent` logic with `buildLoginRedirect(router.asPath)`

### Done criterion

Only one place in the codebase builds `/login?next=...` URLs. `npm run validate` exits 0.

---

## Item 3 — Fix auth guard race condition (add `isSessionFetching`)

**Status**: `[ ]`  
**Layer**: `features`  
**Effort**: ~20 min  
**Depends on**: Item 1 (guard is in features/auth by this point)

### Why

Current race condition:

1. User logs in → `useLoginUser.onSuccess` calls `invalidateQueries({ queryKey: authQueryKeys.session() })`
2. Router navigates to `/` → `MainPageLayout` mounts → `useAuthGuard` runs
3. At this moment: `isPending = false` (cache has stale `unauthenticated` entry), `isFetching = true` (background refetch in progress)
4. `resolveAuthGuardState` sees `unauthenticated` → sets `shouldRedirectToLogin = true` → redirect loop

Fix: guard must treat `isFetching = true` as "still checking", not "data ready".

Additionally, `useLogoutUser` currently uses `setQueryData(false)` — an invalid state (`false` is not `AuthSession`). After this fix, logout can use `invalidateQueries` too, and the guard will correctly wait.

### Steps

1. **Update** `ResolveAuthGuardStateInput` interface in `src/features/auth/model/useAuthGuard.ts`:

   ```ts
   interface ResolveAuthGuardStateInput {
     isPublic: boolean;
     isRouterReady: boolean;
     isSessionPending: boolean;
     isSessionFetching: boolean; // NEW
     sessionState: AuthSessionState | undefined;
   }
   ```

2. **Update** `resolveAuthGuardState` logic:

   ```ts
   if (!input.isRouterReady || input.isSessionPending || input.isSessionFetching) {
     return { isCheckingAuth: true, shouldRedirectToLogin: false };
   }
   ```

3. **Update** `useAuthGuard` hook to pass `isSessionFetching`:

   ```ts
   const guardState = resolveAuthGuardState({
     isPublic,
     isRouterReady: router.isReady,
     isSessionPending: sessionQuery.isPending,
     isSessionFetching: sessionQuery.isFetching, // NEW
     sessionState,
   });
   ```

4. **Update** `useLogoutUser` in `src/features/auth/model/useLogoutUser.ts` (from Item 1):
   - Use `invalidateQueries` instead of `setQueryData(false)`
   - Guard will handle the "waiting for fresh session data" state correctly

5. **Update tests** in `src/features/auth/model/useAuthGuard.test.ts`:
   - Add `isSessionFetching: false` to all existing test cases (non-breaking, just fill the new field)
   - Add new test: `isFetching=true` on protected route → `isCheckingAuth: true, shouldRedirectToLogin: false`
   - Add new test: `sessionState='authenticated'` on protected route → `isCheckingAuth: false, shouldRedirectToLogin: false`

### Done criterion

`npm run validate` exits 0. Unit tests pass including new `isFetching` cases.

---

## Item 4 — Remove `**` wildcard from ESLint `boundaries/entry-point` rule

**Status**: `[ ]`  
**Layer**: config  
**Effort**: ~5 min  
**Depends on**: nothing (but do after Items 1–3 to avoid false positives during refactor)

### Why

In `eslint.config.mjs` the `boundaries/entry-point` rule has:

```js
allow: ['index.ts', 'index.tsx', '**'];
```

The `**` wildcard makes the rule a no-op — any deep import like `@/entities/auth/model/types` passes. Barrel enforcement is currently only caught by steiger at `npm run validate` time, not on save.

### Steps

1. **Edit** `eslint.config.mjs` — remove `'**'` from every `allow` array in the `entry-point` rule:

   ```js
   // Before
   allow: ['index.ts', 'index.tsx', '**'],
   // After
   allow: ['index.ts', 'index.tsx'],
   ```

2. **Run** `npm run lint` to catch any existing barrel violations before they become hidden.

3. Fix any violations found (there should be none if Items 1–3 are done correctly).

### Done criterion

`npm run validate` exits 0. Any cross-slice deep import is caught immediately on file save.

---

## Item 5 — Extract `AuthPageLayout` and `FormErrorAlert` into `shared/ui`

**Status**: `[ ]`  
**Layer**: `shared`  
**Effort**: ~30 min  
**Depends on**: nothing

### Why

`LoginPage.tsx` and `SignupPage.tsx` each contain ~16 lines of identical outer wrapper JSX and an identical error alert block. Any future public auth page (forgot-password, invite-accept) would copy-paste the same structure.

### Steps

1. **Create** `src/shared/ui/AuthPageLayout.tsx`
   - Accepts `children: ReactNode`
   - Contains: outer `<Flex>` wrapper + `<AppBrand />` + centering `<Flex>` + `<Card.Root>`
   - Make card width a prop with default `'xl'`

   ```tsx
   interface AuthPageLayoutProps {
     children: ReactNode;
     cardWidth?: string;
   }
   ```

2. **Create** `src/shared/ui/FormErrorAlert.tsx`
   - Accepts `message: string | null`
   - Renders the error `<Box>` block when `message` is non-null, nothing otherwise
   - Used in LoginPage, SignupPage, and any other form that shows a server error

3. **Export** both from `src/shared/ui/index.ts`

4. **Update** `src/pages/login/ui/LoginPage.tsx`:
   - Replace outer wrapper JSX with `<AuthPageLayout>`
   - Replace error block JSX with `<FormErrorAlert message={requestError} />`

5. **Update** `src/pages/signup/ui/SignupPage.tsx`:
   - Same as above

### Done criterion

`LoginPage.tsx` and `SignupPage.tsx` each lose ~20 lines. `npm run validate` exits 0. Locale keys unchanged (no new user-visible text).

---

## Item 6 — Move Zod validation schemas out of render functions into `model/`

**Status**: `[ ]`  
**Layer**: `pages`  
**Effort**: ~30 min  
**Depends on**: nothing

### Why

`FORMS_ARCHITECTURE.md §5` requires: "Validation schemas live in `features/*/model` or `entities/*/model`, never in `shared/ui`". Currently all schemas are defined inline inside component render functions (LoginPage, SignupPage, HomePage), causing them to be recreated on every render and placing validation logic inside UI files.

Convention agreed during review: since these forms are page-specific, schemas go into `pages/<page>/model/` (not entities/features). When a schema needs to be reused across pages, it gets promoted to `features/` or `entities/` at that point.

### Steps

1. **Create** `src/pages/login/model/loginSchema.ts`
   - Export `createLoginSchema(t: TFunction): ZodObject<...>`
   - Move `z.object({ email, password })` definition here

2. **Create** `src/pages/signup/model/signupSchema.ts`
   - Export `createSignupSchema(t: TFunction): ZodObject<...>`
   - Move `z.object({ email, password, name, language, account: ... })` here
   - Move `languageCodes` and `regionCodes` const arrays here too (they are schema-only concerns)

3. **Create** `src/pages/home/model/leadSchema.ts`
   - Export `createLeadSchema(t: TFunction): ZodObject<...>`
   - Move `z.object({ companyName, contactEmail, distributionChannel, includeNps, notes })` here

4. **Update** each page component:
   - Import schema factory
   - Wrap in `useMemo`: `const schema = useMemo(() => createLoginSchema(t), [t])`
   - Pass to `useZodForm({ schema, ... })`

5. **Create** `src/pages/login/index.ts`, `src/pages/signup/index.ts` barrel update if needed (model exports are internal — do NOT export schemas from page barrels, they are page-private)

### Done criterion

No `z.object(...)` call inside a React component body. `npm run validate` exits 0.

---

## Item 7 — Fix naming convention in `CONTRIBUTING.md`

**Status**: `[ ]`  
**Layer**: docs  
**Effort**: ~5 min  
**Depends on**: nothing

### Why

`CONTRIBUTING.md` states "Files: kebab-case (`use-auth-guard.ts`)" but every file in the project uses camelCase for hooks/utils and PascalCase for components. This misleads AI agents creating new files.

### Steps

1. **Edit** `CONTRIBUTING.md` — replace naming section with:
   ```
   - Hooks and utilities: camelCase (`useAuthGuard.ts`, `queryKeys.ts`)
   - React components: PascalCase (`LoginPage.tsx`, `MainSidebar.tsx`)
   - Slice folders: kebab-case (`main-layout/`, `auth/`)
   - Constants: UPPER_SNAKE_CASE for true module-level constants
   ```

### Done criterion

CONTRIBUTING.md naming section matches actual file naming in the repo.

---

## Item 8 — Mark demo code in `HomePage.tsx` and add rule to `AGENTS.md`

**Status**: `[ ]`  
**Layer**: docs + pages  
**Effort**: ~10 min  
**Depends on**: nothing

### Why

`HomePage.tsx` contains a full demo form (`LeadFormValues`, `leadSchema`, `channelOptions`, JSON preview) that is scaffold/reference code, not production logic. Without marking, AI agents will treat these as established patterns and copy them into production slices.

### Steps

1. **Edit** `src/pages/home/ui/HomePage.tsx`:
   - Add block comment at the top of the demo section:
     ```ts
     // TODO: DEMO — Remove this entire section when real workspace UI is implemented.
     // This form exists only as a live reference for the shared form stack (RHF + Zod + Chakra).
     // Do not copy these patterns directly into production feature slices.
     ```

2. **Edit** `AGENTS.md` — add a new section **after** the i18n section:

   ```md
   ## Demo and scaffold code

   Files or sections marked `// TODO: DEMO` are scaffold/reference code — not production patterns.

   - Do not duplicate types, schemas, or handlers from demo sections into new feature slices.
   - When implementing a real feature, create fresh files in the appropriate FSD layer.
   - Demo sections will be deleted when the corresponding real feature is implemented.
   ```

### Done criterion

`HomePage.tsx` has clear TODO: DEMO comment. `AGENTS.md` has the new section. `npm run validate` exits 0 (docs-only + comment change).

---

## Item 9 — Add `loading` state to `dynamic()` page imports

**Status**: `[ ]`  
**Layer**: `pages` (Next.js entry)  
**Effort**: ~10 min  
**Depends on**: nothing

### Why

`pages/login.tsx`, `pages/signup.tsx`, and `pages/index.tsx` use `dynamic(..., { ssr: false })` without a `loading` prop. Users on slow connections see a blank screen while the JS chunk loads.

### Steps

1. **Edit** `pages/login.tsx`:

   ```tsx
   import { Center, Spinner } from '@chakra-ui/react';
   const LoginPage = dynamic(() => import('@/pages/login/ui/LoginPage'), {
     ssr: false,
     loading: () => (
       <Center minH='dvh'>
         <Spinner size='lg' />
       </Center>
     ),
   });
   ```

2. **Edit** `pages/signup.tsx` — same pattern

3. **Edit** `pages/index.tsx` — same pattern (the auth guard spinner covers it for most cases, but the dynamic loading fallback provides a baseline)

4. Add `loading` import in each file if Spinner/Center not already imported.

### Done criterion

No blank flash on initial page load. `npm run validate` exits 0.

---

## Execution order

Items are independent unless marked with "Depends on". Recommended sequence to minimise conflict:

```
2 (routes helper) → 1 (features/auth) → 3 (guard fix) → 4 (ESLint)
     ↕ parallel ↕
5 (AuthPageLayout) → 6 (schemas) → 7 (naming docs) → 8 (demo) → 9 (loading)
```

Run `npm run fix && npm run validate` after every item before committing.

---

## Explicitly out of scope

The following were discussed and deferred:

| Topic                                                           | Decision                                      |
| --------------------------------------------------------------- | --------------------------------------------- |
| Unit tests for entity hooks (useLogin, useRegister, useSession) | Deferred — add before major auth refactor     |
| Edge-case tests for existing files                              | Deferred                                      |
| Component tests (vitest happy-dom)                              | Deferred                                      |
| Playwright / e2e                                                | Deferred indefinitely                         |
| Request dedup in createApiClient                                | Not needed (React Query covers it)            |
| Global retry strategy                                           | Revisit when data-fetching entities are added |

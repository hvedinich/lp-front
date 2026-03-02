# AI Agent Guidelines

## Documentation references

| Document                | Scope                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ARCHITECTURE.md`       | FSD layers, import/export policy, entity modelling, React Query standard, i18n infrastructure, auth routing |
| `FORMS_ARCHITECTURE.md` | Form stack (RHF + Zod + Chakra v3), file layout, lifecycle, do/don't                                        |
| `CONTRIBUTING.md`       | Dev setup, code style, naming, commit conventions, PR process                                               |

This file (**AGENTS.md**) contains only the rules that AI agents must keep in active context on **every** code change. For full details, consult the documents above.

---

## Mandatory post-implementation workflow

After any code changes, always run in this order:

```bash
npm run fix       # auto-fix: eslint --fix + prettier --write
npm run validate  # read-only: tsc + lint + format:check (must exit 0)
```

> `tsc --noEmit` alone is **not** enough — it does not catch ESLint rules such as
> `no-restricted-imports` (FSD barrel enforcement).

---

## Architecture: Feature-Sliced Design (FSD)

- Layers (top → bottom): `pages → widgets → features → entities → shared`
- A layer may only import from layers **below** it
- Always import from the **public barrel**, never from deep paths:
  - ✅ `import { system } from '@/shared/config'`
  - ❌ `import { system } from '@/shared/config/theme'`
- See `ARCHITECTURE.md` for full details

---

## Design tokens (Chakra UI v3, `strictTokens: true`)

Raw palette refs in Chakra style props **will not compile** — use semantic tokens only.

| Category | Use                                        | Avoid                 |
| -------- | ------------------------------------------ | --------------------- |
| Colors   | `fg.default`, `bg.surface`, `border.focus` | `gray.700`, `red.500` |
| Shadows  | `shadow.card`, `shadow.modal`              | `md`, `lg`            |
| Radii    | `radii.card`, `radii.control`              | `lg`, `md`            |

Interactive states (`_hover`, `_active`) belong **inside component recipes**, not in JSX props.

Surface containers: use `layerStyle="card"` / `"panel"` / `"modal"` / `"subtle"` on `<Box>`.

Full token reference: `src/shared/config/theme/`.

---

## Component API: style passthrough

Every component **must** forward style props to its root element so callers can control layout without extra wrapper elements.

```tsx
// ✅ Correct
interface Props extends Omit<StackProps, 'children' | 'onSelect'> {
  onSelect: () => void;
}
export function MyWidget({ onSelect, ...rest }: Props) {
  return <Stack {...rest}>{/* ... */}</Stack>;
}

// ❌ Wrong — caller cannot pass margin, padding, width, etc.
export function MyWidget({ onSelect }: { onSelect: () => void }) {
  return <Stack>{/* ... */}</Stack>;
}
```

- Extend the root element's props type (`BoxProps`, `StackProps`, `FlexProps`, …)
- `Omit` only props that clash with Chakra / DOM names
- Spread the remainder onto the root element with `{...rest}`
- Full guidance in `CONTRIBUTING.md` → **Component style passthrough**

---

## Code comments language

All comments in source files **must be written in English only** — no exceptions.

- ✅ `// Fetch user session on mount`
- ❌ `// Получаем сессию пользователя при монтировании`

This applies to inline comments, block comments, and JSDoc.

---

## Forms

Form architecture (React Hook Form + Zod + Chakra v3 field wrappers) is defined in `FORMS_ARCHITECTURE.md`. Key points:

- Validation schemas live in `features/*/model` or `entities/*/model`, **never** in `shared/ui`
- Submission handlers call React Query mutations only — no raw `fetch`/`axios` in UI
- Shared field components (`@/shared/ui/form`) must stay domain-free

---

## Internationalisation (i18n)

All user-visible strings must go through `t()`. Hardcoded text in JSX children and props (`aria-label`, `aria-description`, `placeholder`, `title`, `alt`) is a lint error.

Add translation keys to **all three locales** (`en`, `ru`, `pl`) in `public/locales/{lang}/common.json`.

---

## Demo and scaffold code

Files or sections marked `// TODO: DEMO` are scaffold/reference code — not production patterns.

- Do not duplicate types, schemas, or handlers from demo sections into new feature slices.
- When implementing a real feature, create fresh files in the appropriate FSD layer.
- Demo sections will be deleted when the corresponding real feature is implemented.

---

## Planning and scratch files

Files matching `*_PLAN.md` (e.g. `REFACTORING_PLAN.md`) are local planning documents — **never stage or commit them**.

- They are listed in `.gitignore` and must stay there.
- Do not reference plan files in commit messages.
- Never create a new `*_PLAN.md` inside a `git add -A` or blanket staging command — always stage files explicitly.

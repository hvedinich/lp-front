# AI Agent Guidelines

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

Full token reference: `src/shared/config/theme/` and `THEME_PLAN.md`.

---

## Code comments language

All comments in source files **must be written in English only** — no exceptions.

- ✅ `// Fetch user session on mount`
- ❌ `// Получаем сессию пользователя при монтировании`

This applies to inline comments, block comments, and JSDoc.

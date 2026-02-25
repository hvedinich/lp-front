# LP App

New standalone app in this monorepo using:

- Next.js `16.1.6`
- Chakra UI `3.33.0`
- TypeScript `5.9.3`
- i18n locales: `en` (default), `pl`, `ru`

Architecture:

- `apps/lp/ARCHITECTURE.md` (FSD rules, import/export policy, entities + React Query standards)
- `apps/lp/FORMS_ARCHITECTURE.md` (form stack, templates, and field/component rules)

Run from repo root:

```bash
pnpm lp
```

Key routes:

- `/` - i18n demo + form kit example
- `/login` - public login page
- `/signup` - registration form (`POST /auth/register`)

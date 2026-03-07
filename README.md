# LP App

Standalone Next.js application using:

- Next.js `16.1.6`
- Chakra UI `3.33.0`
- TypeScript `5.9.3`
- React Query `5.90.21`
- i18n locales: `en` (default), `pl`, `ru`

## Package Manager

This project uses **npm** as the package manager. The version is enforced via `packageManager` field in `package.json`.

## Setup

```bash
# Install dependencies
npm install

# Run development server (port 4000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run tc

# Format code with Prettier
npm run format
```

## Architecture

- `docs/agents/architecture.md` - FSD rules, import/export policy, entities + React Query standards
- `docs/agents/forms.md` - form stack, templates, and field/component rules

## Key Routes

- `/` - i18n demo + form kit example
- `/login` - public login page
- `/signup` - registration form (`POST /auth/register`)

## Environment Variables

Copy `.env.local` and configure:

- `PORT` - development server port (default: 4000)
- `NEXT_PUBLIC_DEFAULT_LOCALE` - default locale (default: en)
- `NEXT_PUBLIC_LOCALES` - available locales
- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_SITE_URL` - explicit public app URL
- `NEXT_PUBLIC_VERCEL_URL` - Vercel-provided app URL without protocol
- `VERCEL_URL` - runtime Vercel URL fallback without protocol
- `PLAYWRIGHT_E2E_EMAIL` - E2E user email
- `PLAYWRIGHT_E2E_PASSWORD` - E2E user password
- `PLAYWRIGHT_LOCATION_PREFIX` - prefix for E2E-created locations
- `PLAYWRIGHT_WORKERS` - optional local Playwright workers override

## GitHub Actions E2E

- `npm run test` already covers unit tests and page-level integration tests in `src/**`.
- Playwright E2E runs in `.github/workflows/e2e-deployment.yml` after a successful non-production deployment status.
- The workflow takes the deployed preview URL from the deployment status payload and exports it to `PLAYWRIGHT_BASE_URL`.
- In CI, Playwright requires a real deployment URL and does not start a local app server.
- Required GitHub Actions secrets: `NEXT_PUBLIC_API_URL`, `PLAYWRIGHT_E2E_EMAIL`, `PLAYWRIGHT_E2E_PASSWORD`.
- This setup depends on Vercel Git integration publishing preview deployments back to GitHub as `deployment_status` events.

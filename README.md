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

- `ARCHITECTURE.md` - FSD rules, import/export policy, entities + React Query standards
- `FORMS_ARCHITECTURE.md` - form stack, templates, and field/component rules

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
- `NEXT_PUBLIC_AUTH_LOGIN_PATH` - login endpoint
- `NEXT_PUBLIC_AUTH_REGISTER_PATH` - registration endpoint
- `NEXT_PUBLIC_AUTH_SESSION_PATH` - session endpoint

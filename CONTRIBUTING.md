# Contributing to LP

Thank you for considering contributing to the LP project!

## Development Setup

1. **Prerequisites**
   - Node.js 24.x (recommended to use nvm with `.nvmrc`)
   - npm 11.8.0+

2. **Installation**

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd lp-front

   # Install dependencies
   npm install
   ```

3. **Development**

   ```bash
   # Start dev server
   npm run dev

   # Run linting
   npm run lint

   # Fix linting issues
   npm run lint:fix

   # Type check
   npm run tc

   # Format code
   npm run format

   # Validate all (typecheck + lint + format check)
   npm run validate
   ```

## Code Standards

### Architecture

- Follow **Feature-Sliced Design (FSD)** principles (see `ARCHITECTURE.md`)
- Place page-specific logic in `pages` first, extract to lower layers only when reused
- Use public APIs only for cross-slice imports

### Forms

- Follow form architecture guidelines in `FORMS_ARCHITECTURE.md`
- Use `react-hook-form` + `zod` for all forms
- Place validation schemas in `features/*/model` or `entities/*/model`

### Code Style

- **ESLint**: Follow configured rules, run `npm run lint` before committing
- **Prettier**: Code is auto-formatted on save (if using recommended VSCode settings)
- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Imports**:
  - Use `@/*` alias for absolute imports
  - Import from module barrels (`@/shared/hooks`) not deep paths
  - Organize imports: external → internal → types

### Naming Conventions

- **Files**: kebab-case for files (`use-auth-guard.ts`)
- **Components**: PascalCase for components (`LoginPage.tsx`)
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for true constants

### Commits

- Use conventional commit format: `type(scope): message`
  - `feat`: new feature
  - `fix`: bug fix
  - `docs`: documentation changes
  - `style`: formatting, missing semicolons, etc.
  - `refactor`: code restructuring
  - `test`: adding tests
  - `chore`: maintenance tasks

Examples:

```
feat(auth): add session persistence
fix(forms): resolve validation error display
docs(readme): update setup instructions
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes following the code standards
3. Run `npm run validate` to ensure everything passes
4. Create a PR with a clear description of changes
5. Wait for code review and address feedback
6. Once approved, your PR will be merged

## Questions?

If you have questions, please open an issue for discussion.

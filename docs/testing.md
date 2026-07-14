# Testing

This project uses backend automated tests and frontend static verification to reduce regression risk before submission or deployment.

## Backend Feature Tests

The backend test suite uses PHPUnit and Laravel testing utilities. Feature tests cover the API behavior for core modules:

- Authentication
- Users
- Roles
- Permissions
- Projects
- Project Members
- Tasks
- Task Comments
- Dashboard
- Reports

Run all backend tests:

```bash
cd backend
php artisan test
```

Run a single test file:

```bash
php artisan test tests/Feature/AuthenticationTest.php
```

The tests use Laravel's testing database behavior and are designed to verify successful responses, validation errors, and authorization behavior.

## Unit Tests

The repository includes the Laravel unit test structure under:

```txt
backend/tests/Unit/
```

Run unit tests together with the full suite:

```bash
php artisan test
```

Run only unit tests:

```bash
php artisan test tests/Unit
```

## Frontend Lint

Run ESLint:

```bash
cd frontend
npm run lint
```

Linting checks code quality, common React/Next.js issues, and formatting-related implementation concerns covered by the configured ESLint setup.

## TypeScript Verification

Run TypeScript without emitting build files:

```bash
npx tsc --noEmit
```

This validates type safety across pages, feature modules, shared components, API types, hooks, and utilities.

## Production Build

Run the frontend production build:

```bash
npm run build
```

This confirms the application can compile successfully for deployment and catches route/build-time issues that may not appear during development.

## Recommended Final Verification

Before submission, run:

```bash
cd backend
php artisan test
```

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Future Testing Improvements

Potential future additions:

- End-to-end tests for login and role-specific workflows.
- Component tests for forms, tables, dialogs, and navigation.
- Accessibility checks for keyboard navigation and color contrast.
- API contract tests between frontend expectations and backend resources.

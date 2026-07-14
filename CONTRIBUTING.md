# Contributing

Thank you for contributing to the Project and Team Task Management Platform.

## Development Standards

- Keep changes focused and easy to review.
- Do not mix unrelated backend, frontend, and documentation changes in one pull request.
- Follow the existing feature-based frontend structure.
- Keep Laravel controllers thin and place business workflows in services.
- Enforce authorization through backend policies, gates, middleware, and permissions.
- Preserve REST API contracts unless a change is intentionally documented.

## Backend Standards

- PHP 8.4 compatible code.
- PSR-12 style.
- Laravel Pint formatting where applicable.
- Form Requests for validation.
- API Resources for responses.
- Feature tests for business behavior.

## Frontend Standards

- TypeScript-first implementation.
- React Hook Form and Zod for forms.
- TanStack Query for API state.
- Accessible shadcn/Base UI components.
- Responsive layout and dark mode support.

## Pull Request Checklist

- [ ] Backend tests pass with `php artisan test`.
- [ ] Frontend lint passes with `npm run lint`.
- [ ] TypeScript passes with `npx tsc --noEmit`.
- [ ] Frontend build passes with `npm run build`.
- [ ] Documentation is updated when behavior changes.
- [ ] Screenshots are added for visible UI changes when practical.

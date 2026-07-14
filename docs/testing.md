# Testing

## Backend

The backend uses PHPUnit feature tests with `RefreshDatabase` coverage for core modules:

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

Run:

```bash
cd backend
php artisan test
```

## Frontend

The frontend currently uses static verification:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Recommended future additions:

- Component tests for shared UI and forms.
- End-to-end tests for login and core workflows.
- Accessibility checks for admin screens.

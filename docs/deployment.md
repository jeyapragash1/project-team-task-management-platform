# Deployment

This document describes a practical deployment path for the Project and Team Task Management Platform without Docker.

Suggested hosting:

- Frontend: Vercel or another Node.js-capable hosting provider.
- Backend: Render, Laravel Forge, VPS, or another PHP 8.4-capable application host.
- Database: Managed PostgreSQL.

## Backend Setup

Production prerequisites:

- PHP 8.4+
- Composer
- PostgreSQL connection
- Web server configured to serve Laravel's `public/` directory
- HTTPS enabled

Install dependencies:

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Prepare the application:

```bash
cp .env.example .env
php artisan key:generate
```

Set production environment values:

```env
APP_NAME="Project Team Task Management Platform"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
APP_TIMEZONE=Asia/Colombo

DB_CONNECTION=pgsql
DB_HOST=production-postgres-host
DB_PORT=5432
DB_DATABASE=project_team_task_management_platform
DB_USERNAME=production_user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=api.example.com
```

Run database migrations:

```bash
php artisan migrate --force
```

Seed required system data:

```bash
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=PermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
```

Do not run demo data seeders in production unless the deployment is explicitly for demonstration.

Optimize caches:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan permission:cache-reset
```

Run the backend through the hosting provider's PHP process manager or web server. For local verification only:

```bash
php artisan serve
```

## Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Set production environment values:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
NEXT_PUBLIC_APP_NAME="Project Team Task Management Platform"
```

Build the frontend:

```bash
npm run build
```

Run production build locally for verification:

```bash
npm run start
```

For Vercel, configure the environment variables in the project settings and deploy from the repository.

## Production Recommendations

- Keep `APP_ENV=production`.
- Keep `APP_DEBUG=false`.
- Use HTTPS for frontend and backend.
- Use strong database credentials.
- Restrict database access to trusted hosts.
- Rotate default administrator credentials immediately after first login.
- Configure backups for PostgreSQL.
- Configure centralized logs for backend errors.
- Run CI checks before deployment.
- Do not expose `.env` files publicly.

## CI/CD

The repository includes a GitHub Actions workflow that verifies:

- Backend dependency installation
- Backend PHPUnit tests
- Frontend dependency installation
- Frontend linting
- TypeScript type checking
- Frontend production build

Workflow file:

```txt
.github/workflows/ci.yml
```

## Deployment Verification

After deployment, verify:

1. `POST /api/v1/auth/login` returns a token.
2. Protected endpoints accept `Authorization: Bearer <token>`.
3. Frontend login redirects to dashboard.
4. Role-based navigation changes by user role.
5. CRUD workflows work for the seeded administrator.
6. Reports and dashboard load without authorization errors.

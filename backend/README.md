# Backend Application

## Overview

This backend is the Laravel 12 REST API for the Project and Team Task Management Platform. It owns authentication, authorization, validation, business workflows, persistence, API resources, and JSON response contracts for the decoupled Next.js frontend.

The backend uses Laravel Sanctum for bearer-token authentication and Spatie Laravel Permission with Laravel policies for role and permission based access control.

## Folder Structure

```txt
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Policies/
│   └── Services/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── tests/
    └── Feature/
```

## Architecture

- Controllers remain thin and delegate workflow decisions to service classes.
- Form Requests validate incoming payloads before controller actions execute.
- API Resources normalize response payloads for frontend consumption.
- Policies enforce module-level authorization rules.
- Eloquent models define relationships and persistence concerns.
- Seeders prepare system roles, permissions, administrator account, and optional demo data.

## Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

## Environment Setup

Required local values:

```env
APP_NAME="Project Team Task Management Platform"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
APP_TIMEZONE=Asia/Colombo

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=project_team_task_management_platform
DB_USERNAME=postgres
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:8000,127.0.0.1:8000
```

## Database Migration

```bash
php artisan migrate
```

Use a PostgreSQL database that matches the `.env` credentials before running migrations.

## Seeders

System seeders:

```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=AdminUserSeeder
```

Optional demo data:

```bash
php artisan db:seed --class=DemoDataSeeder
```

Default administrator account:

```txt
Email: admin@example.com
Password: Password@123
```

## Testing

```bash
php artisan test
```

The feature test suite covers authentication, user management, roles, permissions, projects, project members, tasks, task comments, dashboard, and reports.

## API Overview

The API is versioned under:

```txt
/api/v1
```

Primary modules:

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

Import the Postman collection from:

```txt
../postman/Project-Team-Task-Management.postman_collection.json
```

## Coding Standards

- PSR-12 coding style.
- Laravel conventions for controllers, requests, resources, policies, services, models, migrations, and seeders.
- Laravel Pint is available through Composer dependencies.
- Business logic belongs in services, not controllers.
- Authorization belongs in policies and permission checks.
- API responses should keep the existing `success`, `message`, and `data` structure.

## Troubleshooting

- Run `php artisan config:clear` after changing environment values.
- Run `php artisan permission:cache-reset` after changing roles or permissions.
- Confirm PostgreSQL is running and credentials match `.env`.
- Use `Authorization: Bearer <token>` for protected API requests.
- If login succeeds but protected routes fail, confirm the token is being sent in the `Authorization` header.

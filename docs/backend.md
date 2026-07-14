# Backend

The backend is a Laravel 12 REST API running on PHP 8.4.

## Responsibilities

- Authentication with Laravel Sanctum personal access tokens.
- Authorization using Policies, Gates, middleware, and Spatie Laravel Permission.
- Request validation with Form Requests.
- Consistent JSON responses through API response helpers and Resources.
- Business workflows in Services.
- Eloquent relationships and PostgreSQL persistence.
- Feature tests for authentication, users, roles, projects, tasks, comments, dashboard, and reports.

## Main Modules

- Authentication
- User Management
- Role & Permission Management
- Project Management
- Project Member Management
- Task Management
- Task Comments
- Dashboard
- Reports

## Commands

```bash
composer install
php artisan key:generate
php artisan migrate --seed
php artisan db:seed --class=DemoDataSeeder
php artisan test
```

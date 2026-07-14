# Project and Team Task Management Platform

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

A production-style project and team task management platform built with a decoupled Laravel REST API and Next.js frontend. The system demonstrates authentication, role-based authorization, project management, team assignment, task tracking, comments, dashboards, reports, API documentation, and portfolio-ready repository structure.

![Project banner](assets/banner.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Project](#running-the-project)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [CI/CD](#cicd)
- [AI Usage](#ai-usage)
- [Default Administrator Account](#default-administrator-account)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Contributors](#contributors)

## Overview

The platform supports three primary user groups: Administrators, Project Managers, and Team Members. Administrators manage users, roles, permissions, and the whole system. Project Managers manage assigned projects, members, and tasks. Team Members view assigned work, update task progress, and comment on authorized tasks.

The frontend and backend are intentionally separated:

- `frontend/`: Next.js App Router application.
- `backend/`: Laravel REST API application.
- `postman/`: Importable API collection and local environment.
- `docs/`: Project documentation.
- `diagrams/`: Mermaid architecture and workflow diagrams.

## Features

| Area | Implemented Capability |
| --- | --- |
| Authentication | Login, logout, current user, profile update, password change |
| Authorization | Laravel Sanctum, Policies, Gates, Middleware, Spatie Laravel Permission |
| Users | List, view, create, update, activate/deactivate, soft delete, restore |
| Roles & Permissions | Role CRUD, permission listing, assign/remove permissions |
| Projects | List, view, create, update, archive, activate, soft delete, restore |
| Project Members | List, add, view, remove project memberships |
| Tasks | List, view, create, update, assign, status update, soft delete, restore |
| Task Comments | List, view, create, update own comment, delete own comment |
| Dashboard | Role-aware statistics, task summaries, recent activity |
| Reports | Users, projects, tasks, progress, and workload reports |
| API Standards | Consistent JSON responses, validation errors, pagination, filtering |
| UI | Responsive application shell, protected routes, dark mode, reusable components |
| Testing | Feature tests for backend modules, frontend lint/type/build verification |

## Technology Stack

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 16.2.10, React 19, TypeScript, Tailwind CSS, shadcn/Base UI, TanStack Query, Axios, React Hook Form, Zod, Lucide React, Sonner |
| Backend | Laravel 12, PHP 8.4, Laravel Sanctum, Spatie Laravel Permission, Eloquent ORM, PHPUnit |
| Database | PostgreSQL |
| API | Versioned REST API under `/api/v1` |
| Tooling | Composer, npm, GitHub Actions, Postman |

## Architecture

The platform uses a decoupled client-server architecture. The frontend owns presentation, routing, forms, cache state, and protected UI flow. The backend owns authentication, authorization, validation, business workflows, persistence, and JSON API contracts.

```mermaid
flowchart LR
    Browser[User Browser] --> Frontend[Next.js Frontend]
    Frontend -->|REST /api/v1| Backend[Laravel API]
    Backend -->|Eloquent ORM| Database[(PostgreSQL)]
    Backend --> Sanctum[Laravel Sanctum]
    Backend --> RBAC[Policies + Spatie Permission]
    Backend --> Logs[Audit & Activity Logs]
```

See [docs/architecture.md](docs/architecture.md), [diagrams/README.md](diagrams/README.md), and the static [architecture image](assets/architecture.svg).

## Folder Structure

```txt
project-team-task-management-platform/
├── backend/                 # Laravel 12 REST API
├── frontend/                # Next.js frontend
├── docs/                    # Project documentation
├── diagrams/                # Mermaid diagrams
├── postman/                 # Postman collection and environment
├── assets/                  # Static README assets and screenshot placeholders
├── .github/                 # GitHub templates and workflows
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE
```

## Installation

Prerequisites:

- PHP 8.4+
- Composer
- Node.js 20+
- npm
- PostgreSQL
- Git

Clone the repository and install each application independently.

## Environment Variables

Backend `.env` essentials:

```env
APP_NAME="Project Team Task Management Platform"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=project_team_task_management_platform
DB_USERNAME=postgres
DB_PASSWORD=postgres

SANCTUM_STATEFUL_DOMAINS=localhost:8000,127.0.0.1:8000
```

Frontend `.env` essentials:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_APP_NAME="Project Team Task Management Platform"
```

## Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan db:seed --class=DemoDataSeeder
php artisan serve
```

The demo data seeder is optional but useful for portfolio review.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

If `.env.example` is not present in `frontend/`, create `.env` using the values shown above.

## Running the Project

Start backend:

```bash
cd backend
php artisan serve
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Running Tests

Backend:

```bash
cd backend
php artisan test
```

Frontend:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Latest verification result: backend tests, frontend lint, TypeScript, and production build passed.

## API Documentation

The API is versioned under:

```txt
http://127.0.0.1:8000/api/v1
```

Postman files:

- [Postman Collection](postman/Project-Team-Task-Management.postman_collection.json)
- [Postman Local Environment](postman/Project-Team-Task-Management-Local.postman_environment.json)

Detailed API notes are available in [docs/api.md](docs/api.md). Authentication details are documented in [docs/authentication.md](docs/authentication.md). Deployment and testing notes are available in [docs/deployment.md](docs/deployment.md) and [docs/testing.md](docs/testing.md).

## Default Administrator Account

After running seeders:

```txt
Email: admin@example.com
Password: Password@123
```

Demo users created by `DemoDataSeeder` also use:

```txt
Password: Password@123
```

## Screenshots

The repository includes real application screenshots in `assets/screenshots/`. The gallery below follows the main product workflow and includes role-specific, dialog, dark-mode, and mobile states.

| Area | Screenshot |
| --- | --- |
| Login | ![Login page](assets/screenshots/login-page.png) |
| Admin dashboard | ![Admin dashboard overview](assets/screenshots/dashboard-overview-admin.png) |
| User management | ![Users management](assets/screenshots/users-management.png) |
| Create user | ![Create user dialog](assets/screenshots/create-user-dialog.png) |
| Roles and permissions | ![Roles and permissions management](assets/screenshots/roles-permissions-management.png) |
| Role details | ![Role details dialog](assets/screenshots/role-details-dialog.png) |
| Assign permissions | ![Assign permissions dialog](assets/screenshots/assign-permissions-dialog.png) |
| Remove permissions | ![Remove permissions dialog](assets/screenshots/remove-permissions-dialog.png) |
| Create role | ![Create role dialog](assets/screenshots/create-role-dialog.png) |
| Project members | ![Project members page](assets/screenshots/project-members-page.png) |
| Add project member | ![Add project member dialog](assets/screenshots/add-project-member-dialog.png) |
| Project member details | ![Project member details dialog](assets/screenshots/project-member-details-dialog.png) |
| Remove project member | ![Remove project member dialog](assets/screenshots/remove-project-member-dialog.png) |
| Reports dashboard | ![Reports dashboard](assets/screenshots/reports-dashboard.png) |
| Task report details | ![Task report details](assets/screenshots/task-report-details.png) |
| Workload report details | ![Workload report details](assets/screenshots/workload-report-details.png) |
| Profile | ![Admin profile page](assets/screenshots/profile-page-admin.png) |
| Change password | ![Change password form](assets/screenshots/change-password-form.png) |
| Settings | ![Settings page](assets/screenshots/settings-page.png) |
| Dark mode dashboard | ![Dashboard dark mode](assets/screenshots/dashboard-dark-mode.png) |
| User menu | ![User menu dropdown](assets/screenshots/user-menu-dropdown.png) |
| Team member dashboard | ![Team member dashboard](assets/screenshots/dashboard-team-member.png) |
| Team member profile | ![Team member profile page](assets/screenshots/profile-page-team-member.png) |
| Team member settings | ![Team member settings page](assets/screenshots/settings-page-team-member.png) |
| Project manager dashboard | ![Project manager dashboard](assets/screenshots/dashboard-project-manager.png) |
| Project members empty state | ![Project members empty state](assets/screenshots/project-members-empty-state.png) |
| Project manager reports | ![Project manager reports](assets/screenshots/reports-project-manager.png) |
| Project manager profile | ![Project manager profile page](assets/screenshots/profile-page-project-manager.png) |
| Project manager settings | ![Project manager settings page](assets/screenshots/settings-page-project-manager.png) |
| Mobile dashboard | ![Mobile dashboard](assets/screenshots/mobile-dashboard.png) |
| Mobile sidebar | ![Mobile sidebar navigation](assets/screenshots/mobile-sidebar-navigation.png) |
## CI/CD

GitHub Actions verifies backend and frontend quality on pushes and pull requests to `main`.

Workflow file:

```txt
.github/workflows/ci.yml
```

The workflow runs backend PHPUnit tests, frontend linting, TypeScript verification, and the frontend production build.

## AI Usage

AI tools were used to assist with requirement analysis, architecture planning, documentation drafting, code scaffolding support, UI polish suggestions, and debugging. Final implementation decisions, testing, verification, and submission preparation were reviewed manually by the developer.
## Future Improvements

These are intentionally not required in the current assessment scope:

- Notifications
- File attachments
- Export reports to PDF/Excel
- Multi-organization workspaces
- Real-time updates
- Advanced analytics charts
- Calendar or timeline views

## License

This project is released under the [MIT License](LICENSE).

## Contributors

- Kisho Jeyapragash

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.




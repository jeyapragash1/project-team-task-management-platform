# Frontend Application

## Overview

This frontend is the Next.js application for the Project and Team Task Management Platform. It provides the protected application shell, authentication flow, dashboard, and management interfaces for users, roles, projects, project members, tasks, comments, reports, profile, and settings.

The frontend communicates with the Laravel backend exclusively through REST API requests.

## Folder Structure

```txt
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   └── (dashboard)/
│   ├── components/
│   │   ├── layouts/
│   │   ├── navigation/
│   │   └── ui/
│   ├── config/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── types/
│   └── utils/
├── public/
├── package.json
└── next.config.ts
```

## Feature Architecture

Feature code is grouped by business module under `src/features/`. Each module owns its page composition, API helpers, forms, validation schemas, hooks, and module-specific UI where applicable.

Shared layout, navigation, and base UI components live under `src/components/`. Cross-cutting providers and utilities live under `src/providers/`, `src/lib/`, `src/hooks/`, and `src/utils/`.

## Installation

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment Setup

Required local values:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_APP_NAME="Project Team Task Management Platform"
```

## Development

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## API Communication

- Axios is used through the shared API client.
- The Sanctum token is sent with protected requests using `Authorization: Bearer <token>`.
- TanStack Query manages server state, loading states, refresh behavior, and cache invalidation.
- React Hook Form and Zod validate client-side form inputs before API submission.

## Theme Support

The application supports light, dark, and system themes through the existing `next-themes` integration. User-facing theme preferences are handled in the settings module and persisted locally.

## State Management

- TanStack Query: remote server state.
- Local storage: authentication token and user preferences.
- React state: component-local UI state such as dialogs, filters, and temporary selections.

## Troubleshooting

- Confirm the backend is running on `http://127.0.0.1:8000`.
- Confirm `NEXT_PUBLIC_API_BASE_URL` points to `/api/v1`.
- Clear browser storage if stale tokens cause authorization errors.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before submission.
- If protected pages redirect to login, confirm a valid token is stored after login.

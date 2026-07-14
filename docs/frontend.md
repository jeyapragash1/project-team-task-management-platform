# Frontend

The frontend is a Next.js application using the App Router, TypeScript, Tailwind CSS, shadcn/Base UI components, TanStack Query, Axios, React Hook Form, and Zod.

## Responsibilities

- Authentication screens and protected route flow.
- Role-aware sidebar navigation.
- Dashboard, user, role, project, member, task, comment, report, profile, and settings screens.
- Form validation with React Hook Form and Zod.
- API integration through Axios and TanStack Query.
- Responsive admin dashboard UI with light/dark theme support.

## Commands

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## UX Notes

The frontend hides navigation items that the current user should not access. This is a user experience improvement only. The backend remains the authoritative security layer.

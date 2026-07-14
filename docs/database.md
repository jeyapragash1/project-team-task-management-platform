# Database

The database is PostgreSQL and follows Laravel-friendly normalized relational design.

## Core Tables

- `users`
- Spatie permission tables: `roles`, `permissions`, `model_has_roles`, `role_has_permissions`, `model_has_permissions`
- `projects`
- `project_members`
- `task_statuses`
- `tasks`
- `task_comments`
- `activity_logs`
- `personal_access_tokens`

## Design Notes

- Soft deletes are used for users, projects, tasks, and task comments.
- `project_members` prevents duplicate membership through a unique project/user pair.
- `tasks` validate priority and progress through database constraints.
- `projects` validate allowed status values and date ordering.
- Activity logs use polymorphic subject references for auditable entities.

See `diagrams/database/database-er.md` for the ER diagram.

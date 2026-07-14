# API Documentation

Base URL:

```txt
http://127.0.0.1:8000/api/v1
```

## Standards

All protected endpoints require a Sanctum bearer token:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

Success response shape:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Validation error response:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Validation message."]
  }
}
```

Common error responses:

| Status | Meaning | Typical Cause |
| --- | --- | --- |
| `401` | Unauthorized | Missing, expired, or invalid bearer token |
| `403` | Forbidden | Authenticated user lacks the required permission or policy access |
| `404` | Not Found | Resource does not exist or is outside the user's authorized scope |
| `422` | Validation Error | Request payload does not satisfy Form Request rules |
| `500` | Server Error | Unexpected application failure |

Pagination responses include Laravel-style pagination metadata when a collection endpoint is paginated.

## Authentication

Required permission: authenticated profile actions require only a valid token. Login is public.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | Authenticate a user and return the current user with a Sanctum token. | Public | None |
| `POST` | `/auth/logout` | Revoke the current access token. | Bearer token | Authenticated user |
| `GET` | `/auth/user` | Return the authenticated user. | Bearer token | Authenticated user |
| `GET` | `/auth/profile` | Return authenticated user's profile. | Bearer token | Authenticated user |
| `PUT` | `/auth/profile` | Update authenticated user's profile. | Bearer token | Authenticated user |
| `PUT` | `/auth/password` | Change authenticated user's password. | Bearer token | Authenticated user |

### `POST /auth/login`

Request example:

```json
{
  "email": "admin@example.com",
  "password": "Password@123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@example.com",
      "roles": ["Administrator"]
    },
    "token": "plain-text-sanctum-token"
  }
}
```

Validation errors: `email`, `password`.

Common errors: `401` invalid credentials, `422` invalid payload.

### Authenticated Profile Requests

Request examples:

```json
{
  "name": "System Administrator",
  "email": "admin@example.com"
}
```

```json
{
  "current_password": "Password@123",
  "password": "NewPassword@123",
  "password_confirmation": "NewPassword@123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@example.com"
  }
}
```

Validation errors: `name`, `email`, `current_password`, `password`, `password_confirmation`.

Common errors: `401`, `403`, `422`.

## Users

Required permission: Administrator-level user management permissions.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/users` | List users with search, filters, sorting, and pagination. | Bearer token | `users.view` |
| `POST` | `/users` | Create a user and assign roles. | Bearer token | `users.create` |
| `GET` | `/users/{user}` | View a single user. | Bearer token | `users.view` |
| `PUT` | `/users/{user}` | Update a user and roles. | Bearer token | `users.update` |
| `DELETE` | `/users/{user}` | Soft delete a user. | Bearer token | `users.delete` |
| `PATCH` | `/users/{user}/status` | Activate or deactivate a user. | Bearer token | `users.update` |
| `POST` | `/users/{user}/restore` | Restore a soft-deleted user. | Bearer token | `users.restore` |

Request examples:

```json
{
  "name": "Project Manager One",
  "email": "manager@example.com",
  "password": "Password@123",
  "password_confirmation": "Password@123",
  "roles": ["Project Manager"],
  "is_active": true
}
```

```json
{
  "is_active": false
}
```

Success response:

```json
{
  "success": true,
  "message": "User saved successfully.",
  "data": {
    "id": 2,
    "name": "Project Manager One",
    "email": "manager@example.com",
    "is_active": true,
    "roles": ["Project Manager"]
  }
}
```

Validation errors: `name`, `email`, `password`, `password_confirmation`, `roles`, `is_active`.

Common errors: `401`, `403`, `404`, `422`.

## Roles

Required permission: Administrator-level role management permissions.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/roles` | List roles with search, sorting, and pagination. | Bearer token | `roles.view` |
| `POST` | `/roles` | Create a role. | Bearer token | `roles.create` |
| `GET` | `/roles/{role}` | View a role and its permissions. | Bearer token | `roles.view` |
| `PUT` | `/roles/{role}` | Update a role. | Bearer token | `roles.update` |
| `DELETE` | `/roles/{role}` | Delete a role when safe. | Bearer token | `roles.delete` |
| `PUT` | `/roles/{role}/permissions` | Sync permissions assigned to a role. | Bearer token | `roles.update` |
| `DELETE` | `/roles/{role}/permissions` | Remove selected permissions from a role. | Bearer token | `roles.update` |

Request examples:

```json
{
  "name": "Quality Reviewer"
}
```

```json
{
  "permissions": ["projects.view", "tasks.view"]
}
```

Success response:

```json
{
  "success": true,
  "message": "Role updated successfully.",
  "data": {
    "id": 4,
    "name": "Quality Reviewer",
    "permissions": ["projects.view", "tasks.view"]
  }
}
```

Validation errors: `name`, `permissions`.

Common errors: `401`, `403`, `404`, `422`; protected system roles may be rejected for unsafe changes.

## Permissions

Required permission: Administrator-level permission visibility.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/permissions` | List available permissions with optional search/filter/sort support. | Bearer token | `permissions.view` |

Request example: no body.

Success response:

```json
{
  "success": true,
  "message": "Permissions retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "users.view",
      "guard_name": "web"
    }
  ]
}
```

Validation errors: query validation errors if unsupported filter or sort values are supplied.

Common errors: `401`, `403`.

## Projects

Required permission: project permissions plus policy scope. Administrators can manage all projects. Project Managers can manage authorized projects.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/projects` | List projects with search, filters, sorting, pagination, archived/deleted filters. | Bearer token | `projects.view` |
| `POST` | `/projects` | Create a project and assign a project manager. | Bearer token | `projects.create` |
| `GET` | `/projects/{project}` | View project details. | Bearer token | `projects.view` |
| `PUT` | `/projects/{project}` | Update project details and manager. | Bearer token | `projects.update` |
| `DELETE` | `/projects/{project}` | Soft delete a project. | Bearer token | `projects.delete` |
| `POST` | `/projects/{project}/restore` | Restore a soft-deleted project. | Bearer token | `projects.restore` |
| `PATCH` | `/projects/{project}/archive` | Archive an active project. | Bearer token | `projects.update` |
| `PATCH` | `/projects/{project}/activate` | Activate an archived project. | Bearer token | `projects.update` |

Request example:

```json
{
  "name": "Client Portal Implementation",
  "description": "Build the client-facing portal for project collaboration.",
  "manager_id": 2,
  "start_date": "2026-07-15",
  "due_date": "2026-08-30",
  "status": "active"
}
```

Success response:

```json
{
  "success": true,
  "message": "Project saved successfully.",
  "data": {
    "id": 1,
    "name": "Client Portal Implementation",
    "status": "active",
    "manager": {
      "id": 2,
      "name": "Project Manager One"
    }
  }
}
```

Validation errors: `name`, `description`, `manager_id`, `start_date`, `due_date`, `status`.

Common errors: `401`, `403`, `404`, `422`.

## Project Members

Required permission: project member permissions plus policy scope. Administrators and assigned Project Managers can manage memberships for authorized projects.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/projects/{project}/members` | List members for a project with search, sorting, and pagination. | Bearer token | `project-members.view` |
| `POST` | `/projects/{project}/members` | Add a user to a project. | Bearer token | `project-members.create` |
| `GET` | `/projects/{project}/members/{projectMember}` | View project member details. | Bearer token | `project-members.view` |
| `DELETE` | `/projects/{project}/members/{projectMember}` | Remove a user from a project. | Bearer token | `project-members.delete` |

Request example:

```json
{
  "user_id": 5
}
```

Success response:

```json
{
  "success": true,
  "message": "Project member added successfully.",
  "data": {
    "id": 1,
    "user": {
      "id": 5,
      "name": "Team Member One"
    },
    "added_by": {
      "id": 2,
      "name": "Project Manager One"
    }
  }
}
```

Validation errors: `user_id`; duplicate memberships are rejected.

Common errors: `401`, `403`, `404`, `422`.

## Tasks

Required permission: task permissions plus project membership or manager/admin policy scope.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/tasks` | List tasks with search, filters, sorting, pagination, and deleted filter. | Bearer token | `tasks.view` |
| `POST` | `/tasks` | Create a task in an authorized project. | Bearer token | `tasks.create` |
| `GET` | `/tasks/{task}` | View task details. | Bearer token | `tasks.view` |
| `PUT` | `/tasks/{task}` | Update task details. | Bearer token | `tasks.update` |
| `DELETE` | `/tasks/{task}` | Soft delete a task. | Bearer token | `tasks.delete` |
| `POST` | `/tasks/{task}/restore` | Restore a soft-deleted task. | Bearer token | `tasks.restore` |
| `PATCH` | `/tasks/{task}/assign` | Assign or reassign a task. | Bearer token | `tasks.assign` |
| `PATCH` | `/tasks/{task}/status` | Update task status. | Bearer token | `tasks.update-status` |

Request examples:

```json
{
  "project_id": 1,
  "title": "Design task board workflow",
  "description": "Prepare task lifecycle states and UI flow.",
  "assignee_id": 5,
  "task_status_id": 1,
  "priority": "high",
  "due_date": "2026-08-05"
}
```

```json
{
  "assignee_id": 6
}
```

```json
{
  "task_status_id": 3
}
```

Success response:

```json
{
  "success": true,
  "message": "Task saved successfully.",
  "data": {
    "id": 1,
    "title": "Design task board workflow",
    "priority": "high",
    "project": {
      "id": 1,
      "name": "Client Portal Implementation"
    },
    "assignee": {
      "id": 5,
      "name": "Team Member One"
    }
  }
}
```

Validation errors: `project_id`, `title`, `description`, `assignee_id`, `task_status_id`, `priority`, `due_date`; assignees must belong to the same project.

Common errors: `401`, `403`, `404`, `422`.

## Task Comments

Required permission: task comment permissions plus project membership policy scope.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/tasks/{task}/comments` | List task comments, newest first. | Bearer token | `task-comments.view` |
| `POST` | `/tasks/{task}/comments` | Add a comment to a task. | Bearer token | `task-comments.create` |
| `GET` | `/tasks/{task}/comments/{taskComment}` | View one task comment. | Bearer token | `task-comments.view` |
| `PUT` | `/tasks/{task}/comments/{taskComment}` | Update own comment, or any comment as Administrator. | Bearer token | `task-comments.update` |
| `DELETE` | `/tasks/{task}/comments/{taskComment}` | Soft delete own comment, or any comment as Administrator. | Bearer token | `task-comments.delete` |

Request example:

```json
{
  "comment": "Initial review is complete. Ready for implementation."
}
```

Success response:

```json
{
  "success": true,
  "message": "Comment saved successfully.",
  "data": {
    "id": 1,
    "comment": "Initial review is complete. Ready for implementation.",
    "author": {
      "id": 5,
      "name": "Team Member One"
    }
  }
}
```

Validation errors: `comment`.

Common errors: `401`, `403`, `404`, `422`.

## Dashboard

Required permission: authenticated role-specific dashboard access.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/dashboard` | Return role-aware dashboard statistics and recent activity. | Bearer token | Dashboard policy access |

Request example: no body.

Success response:

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully.",
  "data": {
    "summary": {
      "total_users": 10,
      "total_projects": 5,
      "total_tasks": 10,
      "completed_tasks": 3,
      "pending_tasks": 4,
      "overdue_tasks": 1
    },
    "tasks_by_status": [],
    "recent_activity": []
  }
}
```

Validation errors: none for normal use.

Common errors: `401`, `403`.

## Reports

Required permission: report access based on role and policy scope.

| Method | URL | Description | Auth | Required Permission |
| --- | --- | --- | --- | --- |
| `GET` | `/reports/users` | Return user report statistics and table-ready data. | Bearer token | `reports.view` |
| `GET` | `/reports/projects` | Return project report statistics and table-ready data. | Bearer token | `reports.view` |
| `GET` | `/reports/tasks` | Return task report statistics and table-ready data. | Bearer token | `reports.view` |
| `GET` | `/reports/project-progress` | Return project progress aggregation. | Bearer token | `reports.view` |
| `GET` | `/reports/workload` | Return workload aggregation by user/project. | Bearer token | `reports.view` |

Query examples:

```txt
/reports/tasks?date_from=2026-07-01&date_to=2026-07-31&project_id=1&user_id=5&task_status_id=2
```

```txt
/reports/users?role=Project%20Manager&date_from=2026-07-01&date_to=2026-07-31
```

Success response:

```json
{
  "success": true,
  "message": "Report retrieved successfully.",
  "data": {
    "summary": {},
    "items": []
  }
}
```

Validation errors: `date_from`, `date_to`, `project_id`, `user_id`, `task_status_id`, `role` when unsupported values are supplied.

Common errors: `401`, `403`, `422`.

## Postman

- Collection: `../postman/Project-Team-Task-Management.postman_collection.json`
- Environment: `../postman/Project-Team-Task-Management-Local.postman_environment.json`

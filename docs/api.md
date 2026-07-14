# API Documentation

Base URL:

```txt
http://127.0.0.1:8000/api/v1
```

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Forbidden."
}
```

Validation error:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

## Endpoint Groups

| Module | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/user`, `GET/PUT /auth/profile`, `PUT /auth/password` |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/{user}`, `PATCH /users/{user}/status`, `POST /users/{user}/restore` |
| Roles | `GET/POST /roles`, `GET/PUT/DELETE /roles/{role}`, `PUT/DELETE /roles/{role}/permissions` |
| Permissions | `GET /permissions` |
| Projects | `GET/POST /projects`, `GET/PUT/DELETE /projects/{project}`, `POST /projects/{project}/restore`, `PATCH /projects/{project}/archive`, `PATCH /projects/{project}/activate` |
| Project Members | `GET/POST /projects/{project}/members`, `GET/DELETE /projects/{project}/members/{projectMember}` |
| Tasks | `GET/POST /tasks`, `GET/PUT/DELETE /tasks/{task}`, `POST /tasks/{task}/restore`, `PATCH /tasks/{task}/assign`, `PATCH /tasks/{task}/status` |
| Comments | `GET/POST /tasks/{task}/comments`, `GET/PUT/DELETE /tasks/{task}/comments/{taskComment}` |
| Dashboard | `GET /dashboard` |
| Reports | `GET /reports/users`, `/reports/projects`, `/reports/tasks`, `/reports/project-progress`, `/reports/workload` |

## Postman

- Collection: `../postman/CyphLab-API.postman_collection.json`
- Environment: `../postman/CyphLab-Local.postman_environment.json`

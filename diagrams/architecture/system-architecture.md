# System Architecture

```mermaid
flowchart LR
    Browser[User Browser] --> Frontend[Next.js Frontend]
    Frontend -->|REST API| Backend[Laravel API]
    Backend -->|Sanctum Token Auth| Auth[Authentication]
    Backend -->|Policies + Permissions| Authz[Authorization]
    Backend -->|Eloquent ORM| DB[(PostgreSQL)]
    Backend --> Logs[Audit & Activity Logs]
```

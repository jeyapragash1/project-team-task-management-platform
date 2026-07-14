# Postman Collection

This folder contains the importable Postman assets for the Project and Team Task Management Platform API.

## Files

- `Project-Team-Task-Management.postman_collection.json`
- `Project-Team-Task-Management-Local.postman_environment.json`

## Usage

1. Open Postman.
2. Import the collection file.
3. Import the local environment file.
4. Select the local environment.
5. Run the login request first to save the Sanctum bearer token.
6. Run protected requests with `Authorization: Bearer {{token}}`.

Default administrator credentials for local seeded data:

```txt
Email: admin@example.com
Password: Password@123
```

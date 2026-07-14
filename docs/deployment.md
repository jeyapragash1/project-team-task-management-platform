# Deployment

Suggested deployment architecture:

- Frontend: Vercel
- Backend: Render or another PHP-capable application host
- Database: Managed PostgreSQL

## Backend Deployment Checklist

- Set production `.env` values.
- Disable debug mode.
- Configure database credentials.
- Run migrations.
- Seed only required system roles, permissions, and administrator user.
- Configure CORS and frontend URL.
- Use HTTPS.

## Frontend Deployment Checklist

- Set `NEXT_PUBLIC_API_BASE_URL` to the production API URL.
- Build with `npm run build`.
- Verify authenticated routes and API requests.

## CI/CD

GitHub Actions can run backend tests and frontend verification on pull requests and pushes.

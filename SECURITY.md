# Security Policy

## Supported Versions

This repository is an assessment/portfolio project. Security fixes should target the current main branch.

## Reporting a Vulnerability

Please do not publish sensitive vulnerability details in a public issue. Report security concerns privately to the repository owner with:

- A clear description of the issue.
- Steps to reproduce.
- Affected module or endpoint.
- Potential impact.
- Suggested mitigation if known.

## Security Practices

- Do not commit `.env` files or secrets.
- Rotate leaked credentials immediately.
- Keep Composer and npm dependencies up to date.
- Use Laravel Policies and Spatie permissions for protected behavior.
- Validate all incoming backend requests.

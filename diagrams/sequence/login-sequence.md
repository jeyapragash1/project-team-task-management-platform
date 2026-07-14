# Login Sequence

```mermaid
sequenceDiagram
    participant Browser
    participant LoginPage
    participant Axios
    participant AuthController
    participant AuthService

    Browser->>LoginPage: Enter credentials
    LoginPage->>Axios: Login mutation
    Axios->>AuthController: POST /auth/login
    AuthController->>AuthService: Validate credentials
    AuthService-->>AuthController: User and Sanctum token
    AuthController-->>Axios: JSON success response
    Axios-->>LoginPage: Store token and redirect
```

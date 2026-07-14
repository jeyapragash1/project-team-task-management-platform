# Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> InProgress
    InProgress --> InReview
    InReview --> Completed
    InProgress --> Blocked
    Blocked --> InProgress
    Pending --> Completed
    Completed --> [*]
```

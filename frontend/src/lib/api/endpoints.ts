export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    user: "/auth/user",
    profile: "/auth/profile",
    password: "/auth/password",
  },
  dashboard: "/dashboard",
  users: "/users",
  roles: "/roles",
  permissions: "/permissions",
  projects: "/projects",
  projectMembers: (projectId: number) => `/projects/${projectId}/members`,
  tasks: "/tasks",
  reports: {
    users: "/reports/users",
    projects: "/reports/projects",
    tasks: "/reports/tasks",
    projectProgress: "/reports/project-progress",
    workload: "/reports/workload",
  },
} as const;


export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  users: {
    index: "/users",
  },
  roles: {
    index: "/roles",
  },
  projects: {
    index: "/projects",
    members: "/project-members",
  },
  tasks: {
    index: "/tasks",
  },
  reports: {
    index: "/reports",
  },
  profile: "/profile",
  settings: "/settings",
} as const;

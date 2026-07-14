import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  Home,
  Settings,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";

import { ROUTES, SYSTEM_ROLES } from "@/constants";
import type { NavigationItem } from "@/types/navigation";

export const sidebarNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.dashboard,
    icon: Home,
    permissions: ["dashboard.view"],
  },
  {
    title: "User Management",
    href: ROUTES.users.index,
    icon: Users,
    permissions: ["users.view"],
    roles: [SYSTEM_ROLES.administrator],
  },
  {
    title: "Roles & Permissions",
    href: ROUTES.roles.index,
    icon: ShieldCheck,
    permissions: ["roles.view", "permissions.view"],
    roles: [SYSTEM_ROLES.administrator],
  },
  {
    title: "Projects",
    href: ROUTES.projects.index,
    icon: FolderKanban,
    permissions: ["projects.view"],
  },
  {
    title: "Project Members",
    href: ROUTES.projects.members,
    icon: UserPlus,
    permissions: ["project_members.view", "project_members.manage"],
    roles: [SYSTEM_ROLES.administrator, SYSTEM_ROLES.projectManager],
  },
  {
    title: "Tasks",
    href: ROUTES.tasks.index,
    icon: CheckSquare,
    permissions: ["tasks.view"],
  },
  {
    title: "Reports",
    href: ROUTES.reports.index,
    icon: BarChart3,
    permissions: ["reports.view"],
    roles: [SYSTEM_ROLES.administrator, SYSTEM_ROLES.projectManager],
  },
  {
    title: "Profile",
    href: ROUTES.profile,
    icon: UserCircle,
  },
  {
    title: "Settings",
    href: ROUTES.settings,
    icon: Settings,
  },
];

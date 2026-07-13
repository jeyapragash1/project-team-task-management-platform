import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { NavigationItem } from "@/types/navigation";

export const sidebarNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.dashboard,
    icon: Home,
    permissions: ["dashboard.view"],
  },
  {
    title: "Projects",
    href: ROUTES.projects.index,
    icon: FolderKanban,
    permissions: ["projects.view"],
  },
  {
    title: "Tasks",
    href: ROUTES.tasks.index,
    icon: CheckSquare,
    permissions: ["tasks.view"],
  },
  {
    title: "Users",
    href: ROUTES.users.index,
    icon: Users,
    permissions: ["users.view"],
  },
  {
    title: "Roles & Permissions",
    href: ROUTES.roles.index,
    icon: ShieldCheck,
    permissions: ["roles.view", "permissions.view"],
  },
  {
    title: "Reports",
    href: ROUTES.reports.index,
    icon: BarChart3,
    permissions: ["reports.view"],
  },
];

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

import { ROUTES } from "@/constants/routes";
import type { NavigationItem } from "@/types/navigation";

export const sidebarNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.dashboard,
    icon: Home,
  },
  {
    title: "User Management",
    href: ROUTES.users.index,
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    href: ROUTES.roles.index,
    icon: ShieldCheck,
  },
  {
    title: "Projects",
    href: ROUTES.projects.index,
    icon: FolderKanban,
  },
  {
    title: "Project Members",
    href: ROUTES.projects.members,
    icon: UserPlus,
  },
  {
    title: "Tasks",
    href: ROUTES.tasks.index,
    icon: CheckSquare,
  },
  {
    title: "Reports",
    href: ROUTES.reports.index,
    icon: BarChart3,
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

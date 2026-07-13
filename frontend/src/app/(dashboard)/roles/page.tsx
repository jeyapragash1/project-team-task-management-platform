import type { Metadata } from "next";

import { RoleManagementPage } from "@/features/roles";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

export default function RolesPage() {
  return <RoleManagementPage />;
}

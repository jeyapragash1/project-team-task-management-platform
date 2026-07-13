import type { Metadata } from "next";

import { UserManagementPage } from "@/features/users";

export const metadata: Metadata = {
  title: "User Management",
};

export default function UsersPage() {
  return <UserManagementPage />;
}

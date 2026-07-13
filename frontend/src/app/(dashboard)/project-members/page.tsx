import type { Metadata } from "next";

import { ProjectMemberManagementPage } from "@/features/project-members";

export const metadata: Metadata = {
  title: "Project Members",
};

export default function ProjectMembersPage() {
  return <ProjectMemberManagementPage />;
}

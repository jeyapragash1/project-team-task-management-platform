import type { Metadata } from "next";

import { ProjectManagementPage } from "@/features/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return <ProjectManagementPage />;
}

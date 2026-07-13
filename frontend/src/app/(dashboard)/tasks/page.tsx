import type { Metadata } from "next";

import { TaskManagementPage } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return <TaskManagementPage />;
}

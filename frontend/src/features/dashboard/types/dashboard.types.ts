import type { User } from "@/types";

export type DashboardStatistics = {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  archived_projects: number;
  total_tasks: number;
  overdue_tasks: number;
  assigned_tasks: number;
  completed_tasks: number;
};

export type DashboardTaskStatus = {
  status_id: number;
  name: string;
  slug: string;
  total: number;
};

export type DashboardActivity = {
  id: number;
  action: string;
  subject_type: string;
  subject_id: number;
  entity_label: string | null;
  user: User | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DashboardResponse = {
  role: string;
  scope: "system" | "managed_projects" | "personal_workload" | string;
  statistics: DashboardStatistics;
  tasks_by_status: DashboardTaskStatus[];
  recent_activity: DashboardActivity[];
};

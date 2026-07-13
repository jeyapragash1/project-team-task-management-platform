import type { DashboardTaskStatus } from "@/features/dashboard/types/dashboard.types";
import type { ManagedProject } from "@/features/projects/types/project-management.types";
import type { ManagedUser } from "@/features/users/types/user-management.types";
import type { ListQueryParams } from "@/types";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type ManagedTaskStatus = Omit<DashboardTaskStatus, "total"> & {
  sort_order?: number;
  is_default?: boolean;
};

export type ManagedTask = {
  id: number;
  project_id: number;
  status_id: number;
  assigned_to_id: number | null;
  created_by_id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  progress: number;
  due_date: string | null;
  completed_at: string | null;
  project: ManagedProject | null;
  status: ManagedTaskStatus | null;
  assignee: ManagedUser | null;
  creator: ManagedUser | null;
  comments_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type TaskListParams = ListQueryParams & {
  project_id?: number;
  status_id?: number;
  assigned_to_id?: number;
  created_by_id?: number;
  priority?: TaskPriority;
  due_from?: string;
  due_to?: string;
  trashed?: "with" | "only";
};

export type TaskFormPayload = {
  project_id: number;
  status_id: number;
  assigned_to_id?: number | null;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  progress?: number;
  due_date?: string | null;
};

export type TaskAssignPayload = {
  assigned_to_id: number;
};

export type TaskStatusPayload = {
  status_id: number;
  progress?: number;
};

import type { Project } from "./project";
import type { User } from "./user";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus = {
  id: number;
  name: string;
  color: string | null;
  sort_order: number;
};

export type Task = {
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
  project?: Project;
  status?: TaskStatus;
  assignee?: User | null;
  created_by?: User;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

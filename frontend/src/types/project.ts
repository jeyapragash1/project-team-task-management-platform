import type { User } from "./user";

export type ProjectStatus = "active" | "on_hold" | "completed" | "cancelled" | "archived";

export type Project = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  manager?: User;
  created_by?: User;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

import type { ListQueryParams } from "@/types";
import type { ManagedUser } from "@/features/users/types/user-management.types";

export type ProjectStatus = "active" | "on_hold" | "completed" | "cancelled" | "archived";

export type ManagedProject = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  manager: ManagedUser | null;
  creator: ManagedUser | null;
  tasks_count?: number;
  members_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type ProjectListParams = ListQueryParams & {
  status?: ProjectStatus;
  manager_id?: number;
  created_by_id?: number;
  due_from?: string;
  due_to?: string;
  trashed?: "with" | "only";
};

export type ProjectFormPayload = {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  due_date?: string | null;
  manager_id: number;
};

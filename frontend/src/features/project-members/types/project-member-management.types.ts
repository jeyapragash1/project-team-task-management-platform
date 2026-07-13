import type { ListQueryParams } from "@/types";
import type { ManagedUser } from "@/features/users/types/user-management.types";

export type ProjectMemberListParams = ListQueryParams & {
  role?: string;
  status?: "active" | "inactive";
};

export type ProjectMember = {
  id: number;
  project_id: number;
  user: ManagedUser | null;
  added_by: ManagedUser | null;
  created_at?: string;
  updated_at?: string;
};

export type AddProjectMemberPayload = {
  user_ids: number[];
};

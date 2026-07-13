import type { ManagedUser } from "@/features/users/types/user-management.types";
import type { ListQueryParams } from "@/types";

export type TaskComment = {
  id: number;
  task_id: number;
  user_id: number;
  body: string;
  user: ManagedUser | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type TaskCommentListParams = Pick<ListQueryParams, "sort" | "direction" | "per_page" | "page">;

export type TaskCommentPayload = {
  body: string;
};

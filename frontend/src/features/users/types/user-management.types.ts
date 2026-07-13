import type { ListQueryParams } from "@/types";

export type UserRoleName = "Administrator" | "Project Manager" | "Team Member" | string;

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  is_active: boolean;
  roles: UserRoleName[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type UserListParams = ListQueryParams & {
  role?: string;
  status?: "active" | "inactive";
  trashed?: "with" | "only";
};

export type UserFormPayload = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  is_active?: boolean;
  roles: string[];
};

export type UserStatusPayload = {
  is_active: boolean;
};

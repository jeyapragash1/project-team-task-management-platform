import type { ListQueryParams, Permission, Role } from "@/types";

export type RoleListParams = ListQueryParams & {
  guard_name?: string;
};

export type RolePayload = {
  name: string;
  permissions?: string[];
};

export type PermissionPayload = {
  permissions: string[];
};

export type ManagedRole = Role & {
  is_protected: boolean;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
};

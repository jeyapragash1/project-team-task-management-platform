import type { ListQueryParams, Permission } from "@/types";

export type PermissionListParams = ListQueryParams & {
  guard_name?: string;
};

export type ManagedPermission = Permission;

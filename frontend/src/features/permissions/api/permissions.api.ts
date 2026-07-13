import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { PaginatedResponse } from "@/types";

import type { ManagedPermission, PermissionListParams } from "../types/permission-management.types";

export async function listPermissions(
  params: PermissionListParams = {},
): Promise<PaginatedResponse<ManagedPermission>> {
  const response = await apiClient.get<PaginatedResponse<ManagedPermission>>(API_ENDPOINTS.permissions, {
    params,
  });

  return response.data;
}

export async function listAllPermissions(): Promise<ManagedPermission[]> {
  const response = await listPermissions({ per_page: 100, sort: "name", direction: "asc" });

  return response.data;
}

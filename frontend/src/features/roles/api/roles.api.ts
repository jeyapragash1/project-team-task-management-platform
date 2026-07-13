import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { PaginatedResponse, Role } from "@/types";

import type { ManagedRole, PermissionPayload, RoleListParams, RolePayload } from "../types/role-management.types";

export async function listRoles(params: RoleListParams = {}): Promise<PaginatedResponse<ManagedRole>> {
  const response = await apiClient.get<PaginatedResponse<ManagedRole>>(API_ENDPOINTS.roles, {
    params,
  });

  return response.data;
}

export async function listRoleOptions(): Promise<Role[]> {
  const response = await listRoles({ per_page: 100, sort: "name", direction: "asc" });

  return response.data;
}

export async function getRole(roleId: number): Promise<ManagedRole> {
  const response = await apiClient.get<{ success: boolean; message: string; data: ManagedRole }>(
    `${API_ENDPOINTS.roles}/${roleId}`,
  );

  return response.data.data;
}

export async function createRole(payload: RolePayload): Promise<ManagedRole> {
  const response = await apiClient.post<{ success: boolean; message: string; data: ManagedRole }>(
    API_ENDPOINTS.roles,
    payload,
  );

  return response.data.data;
}

export async function updateRole(roleId: number, payload: RolePayload): Promise<ManagedRole> {
  const response = await apiClient.put<{ success: boolean; message: string; data: ManagedRole }>(
    `${API_ENDPOINTS.roles}/${roleId}`,
    { name: payload.name },
  );

  return response.data.data;
}

export async function deleteRole(roleId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.roles}/${roleId}`);
}

export async function assignRolePermissions(roleId: number, payload: PermissionPayload): Promise<ManagedRole> {
  const response = await apiClient.put<{ success: boolean; message: string; data: ManagedRole }>(
    `${API_ENDPOINTS.roles}/${roleId}/permissions`,
    payload,
  );

  return response.data.data;
}

export async function removeRolePermissions(roleId: number, payload: PermissionPayload): Promise<ManagedRole> {
  const response = await apiClient.delete<{ success: boolean; message: string; data: ManagedRole }>(
    `${API_ENDPOINTS.roles}/${roleId}/permissions`,
    { data: payload },
  );

  return response.data.data;
}

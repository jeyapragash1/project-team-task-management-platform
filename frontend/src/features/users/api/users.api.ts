import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

import type {
  ManagedUser,
  UserFormPayload,
  UserListParams,
  UserStatusPayload,
} from "../types/user-management.types";

export async function listUsers(params: UserListParams): Promise<PaginatedResponse<ManagedUser>> {
  const response = await apiClient.get<PaginatedResponse<ManagedUser>>(API_ENDPOINTS.users, {
    params,
  });

  return response.data;
}

export async function getUser(userId: number): Promise<ManagedUser> {
  const response = await apiClient.get<ApiResponse<ManagedUser>>(`${API_ENDPOINTS.users}/${userId}`);

  return response.data.data;
}

export async function createUser(payload: UserFormPayload): Promise<ManagedUser> {
  const response = await apiClient.post<ApiResponse<ManagedUser>>(API_ENDPOINTS.users, payload);

  return response.data.data;
}

export async function updateUser(userId: number, payload: UserFormPayload): Promise<ManagedUser> {
  const response = await apiClient.put<ApiResponse<ManagedUser>>(`${API_ENDPOINTS.users}/${userId}`, payload);

  return response.data.data;
}

export async function updateUserStatus(userId: number, payload: UserStatusPayload): Promise<ManagedUser> {
  const response = await apiClient.patch<ApiResponse<ManagedUser>>(
    `${API_ENDPOINTS.users}/${userId}/status`,
    payload,
  );

  return response.data.data;
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.users}/${userId}`);
}

export async function restoreUser(userId: number): Promise<ManagedUser> {
  const response = await apiClient.post<ApiResponse<ManagedUser>>(`${API_ENDPOINTS.users}/${userId}/restore`);

  return response.data.data;
}

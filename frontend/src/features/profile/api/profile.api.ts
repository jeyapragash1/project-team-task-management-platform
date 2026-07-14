import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, User } from "@/types";

import type { ChangePasswordPayload, UpdateProfilePayload } from "@/features/auth/types/auth.types";

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.auth.profile);

  return response.data.data;
}

export async function updateProfileDetails(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.auth.profile, payload);

  return response.data.data;
}

export async function updateProfilePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put(API_ENDPOINTS.auth.password, payload);
}

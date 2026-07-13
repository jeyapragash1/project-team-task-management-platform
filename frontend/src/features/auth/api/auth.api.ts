import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, User } from "@/types";

import type {
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  UpdateProfilePayload,
} from "../types/auth.types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.auth.login,
    payload,
  );

  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.logout);
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.auth.user);

  return response.data.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>(
    API_ENDPOINTS.auth.profile,
    payload,
  );

  return response.data.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put(API_ENDPOINTS.auth.password, payload);
}

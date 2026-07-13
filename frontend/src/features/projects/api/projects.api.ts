import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

import type { ManagedProject, ProjectFormPayload, ProjectListParams } from "../types/project-management.types";

export async function listProjects(params: ProjectListParams): Promise<PaginatedResponse<ManagedProject>> {
  const response = await apiClient.get<PaginatedResponse<ManagedProject>>(API_ENDPOINTS.projects, { params });

  return response.data;
}

export async function getProject(projectId: number): Promise<ManagedProject> {
  const response = await apiClient.get<ApiResponse<ManagedProject>>(`${API_ENDPOINTS.projects}/${projectId}`);

  return response.data.data;
}

export async function createProject(payload: ProjectFormPayload): Promise<ManagedProject> {
  const response = await apiClient.post<ApiResponse<ManagedProject>>(API_ENDPOINTS.projects, payload);

  return response.data.data;
}

export async function updateProject(projectId: number, payload: ProjectFormPayload): Promise<ManagedProject> {
  const response = await apiClient.put<ApiResponse<ManagedProject>>(`${API_ENDPOINTS.projects}/${projectId}`, payload);

  return response.data.data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.projects}/${projectId}`);
}

export async function restoreProject(projectId: number): Promise<ManagedProject> {
  const response = await apiClient.post<ApiResponse<ManagedProject>>(`${API_ENDPOINTS.projects}/${projectId}/restore`);

  return response.data.data;
}

export async function archiveProject(projectId: number): Promise<ManagedProject> {
  const response = await apiClient.patch<ApiResponse<ManagedProject>>(`${API_ENDPOINTS.projects}/${projectId}/archive`);

  return response.data.data;
}

export async function activateProject(projectId: number): Promise<ManagedProject> {
  const response = await apiClient.patch<ApiResponse<ManagedProject>>(`${API_ENDPOINTS.projects}/${projectId}/activate`);

  return response.data.data;
}

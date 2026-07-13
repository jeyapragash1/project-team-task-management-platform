import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

import type {
  AddProjectMemberPayload,
  ProjectMember,
  ProjectMemberListParams,
} from "../types/project-member-management.types";

function projectMembersUrl(projectId: number) {
  return API_ENDPOINTS.projectMembers(projectId);
}

export async function listProjectMembers(
  projectId: number,
  params: ProjectMemberListParams,
): Promise<PaginatedResponse<ProjectMember>> {
  const response = await apiClient.get<PaginatedResponse<ProjectMember>>(projectMembersUrl(projectId), { params });

  return response.data;
}

export async function addProjectMembers(
  projectId: number,
  payload: AddProjectMemberPayload,
): Promise<ProjectMember[]> {
  const response = await apiClient.post<ApiResponse<ProjectMember[]>>(projectMembersUrl(projectId), payload);

  return response.data.data;
}

export async function getProjectMember(projectId: number, memberId: number): Promise<ProjectMember> {
  const response = await apiClient.get<ApiResponse<ProjectMember>>(`${projectMembersUrl(projectId)}/${memberId}`);

  return response.data.data;
}

export async function removeProjectMember(projectId: number, memberId: number): Promise<void> {
  await apiClient.delete(`${projectMembersUrl(projectId)}/${memberId}`);
}

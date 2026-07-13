import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

import type { TaskComment, TaskCommentListParams, TaskCommentPayload } from "../types/task-comment-management.types";

function taskCommentsUrl(taskId: number) {
  return `${API_ENDPOINTS.tasks}/${taskId}/comments`;
}

export async function listTaskComments(taskId: number, params: TaskCommentListParams): Promise<PaginatedResponse<TaskComment>> {
  const response = await apiClient.get<PaginatedResponse<TaskComment>>(taskCommentsUrl(taskId), { params });

  return response.data;
}

export async function createTaskComment(taskId: number, payload: TaskCommentPayload): Promise<TaskComment> {
  const response = await apiClient.post<ApiResponse<TaskComment>>(taskCommentsUrl(taskId), payload);

  return response.data.data;
}

export async function getTaskComment(taskId: number, commentId: number): Promise<TaskComment> {
  const response = await apiClient.get<ApiResponse<TaskComment>>(`${taskCommentsUrl(taskId)}/${commentId}`);

  return response.data.data;
}

export async function updateTaskComment(taskId: number, commentId: number, payload: TaskCommentPayload): Promise<TaskComment> {
  const response = await apiClient.put<ApiResponse<TaskComment>>(`${taskCommentsUrl(taskId)}/${commentId}`, payload);

  return response.data.data;
}

export async function deleteTaskComment(taskId: number, commentId: number): Promise<void> {
  await apiClient.delete(`${taskCommentsUrl(taskId)}/${commentId}`);
}

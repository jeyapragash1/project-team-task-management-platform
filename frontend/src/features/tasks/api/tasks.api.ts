import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

import type {
  ManagedTask,
  TaskAssignPayload,
  TaskFormPayload,
  TaskListParams,
  TaskStatusPayload,
} from "../types/task-management.types";

export async function listTasks(params: TaskListParams): Promise<PaginatedResponse<ManagedTask>> {
  const response = await apiClient.get<PaginatedResponse<ManagedTask>>(API_ENDPOINTS.tasks, { params });

  return response.data;
}

export async function getTask(taskId: number): Promise<ManagedTask> {
  const response = await apiClient.get<ApiResponse<ManagedTask>>(`${API_ENDPOINTS.tasks}/${taskId}`);

  return response.data.data;
}

export async function createTask(payload: TaskFormPayload): Promise<ManagedTask> {
  const response = await apiClient.post<ApiResponse<ManagedTask>>(API_ENDPOINTS.tasks, payload);

  return response.data.data;
}

export async function updateTask(taskId: number, payload: TaskFormPayload): Promise<ManagedTask> {
  const response = await apiClient.put<ApiResponse<ManagedTask>>(`${API_ENDPOINTS.tasks}/${taskId}`, payload);

  return response.data.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.tasks}/${taskId}`);
}

export async function restoreTask(taskId: number): Promise<ManagedTask> {
  const response = await apiClient.post<ApiResponse<ManagedTask>>(`${API_ENDPOINTS.tasks}/${taskId}/restore`);

  return response.data.data;
}

export async function assignTask(taskId: number, payload: TaskAssignPayload): Promise<ManagedTask> {
  const response = await apiClient.patch<ApiResponse<ManagedTask>>(`${API_ENDPOINTS.tasks}/${taskId}/assign`, payload);

  return response.data.data;
}

export async function updateTaskStatus(taskId: number, payload: TaskStatusPayload): Promise<ManagedTask> {
  const response = await apiClient.patch<ApiResponse<ManagedTask>>(`${API_ENDPOINTS.tasks}/${taskId}/status`, payload);

  return response.data.data;
}

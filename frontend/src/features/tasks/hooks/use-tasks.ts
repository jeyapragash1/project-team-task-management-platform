"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  assignTask,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  restoreTask,
  updateTask,
  updateTaskStatus,
} from "../api/tasks.api";
import type { TaskAssignPayload, TaskFormPayload, TaskListParams, TaskStatusPayload } from "../types/task-management.types";

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks, params],
    queryFn: () => listTasks(params),
  });
}

export function useTask(taskId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks, "detail", taskId],
    queryFn: () => getTask(taskId as number),
    enabled: Boolean(taskId),
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const invalidateTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
  };

  return {
    create: useMutation({
      mutationFn: (payload: TaskFormPayload) => createTask(payload),
      onSuccess: async () => {
        toast.success("Task created successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    update: useMutation({
      mutationFn: ({ taskId, payload }: { taskId: number; payload: TaskFormPayload }) => updateTask(taskId, payload),
      onSuccess: async () => {
        toast.success("Task updated successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    delete: useMutation({
      mutationFn: (taskId: number) => deleteTask(taskId),
      onSuccess: async () => {
        toast.success("Task deleted successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    restore: useMutation({
      mutationFn: (taskId: number) => restoreTask(taskId),
      onSuccess: async () => {
        toast.success("Task restored successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    assign: useMutation({
      mutationFn: ({ taskId, payload }: { taskId: number; payload: TaskAssignPayload }) => assignTask(taskId, payload),
      onSuccess: async () => {
        toast.success("Task assigned successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    updateStatus: useMutation({
      mutationFn: ({ taskId, payload }: { taskId: number; payload: TaskStatusPayload }) => updateTaskStatus(taskId, payload),
      onSuccess: async () => {
        toast.success("Task status updated successfully.");
        await invalidateTasks();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

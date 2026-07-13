"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  createTaskComment,
  deleteTaskComment,
  getTaskComment,
  listTaskComments,
  updateTaskComment,
} from "../api/task-comments.api";
import type { TaskCommentListParams, TaskCommentPayload } from "../types/task-comment-management.types";

export function useTaskComments(taskId?: number, params: TaskCommentListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.taskComments, taskId, params],
    queryFn: () => listTaskComments(taskId as number, params),
    enabled: Boolean(taskId),
  });
}

export function useTaskComment(taskId?: number, commentId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.taskComments, taskId, "detail", commentId],
    queryFn: () => getTaskComment(taskId as number, commentId as number),
    enabled: Boolean(taskId && commentId),
  });
}

export function useTaskCommentMutations(taskId?: number) {
  const queryClient = useQueryClient();

  const invalidateComments = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskComments });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };

  return {
    create: useMutation({
      mutationFn: (payload: TaskCommentPayload) => createTaskComment(taskId as number, payload),
      onSuccess: async () => {
        toast.success("Comment created successfully.");
        await invalidateComments();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    update: useMutation({
      mutationFn: ({ commentId, payload }: { commentId: number; payload: TaskCommentPayload }) =>
        updateTaskComment(taskId as number, commentId, payload),
      onSuccess: async () => {
        toast.success("Comment updated successfully.");
        await invalidateComments();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    delete: useMutation({
      mutationFn: (commentId: number) => deleteTaskComment(taskId as number, commentId),
      onSuccess: async () => {
        toast.success("Comment deleted successfully.");
        await invalidateComments();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

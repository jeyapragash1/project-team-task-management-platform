"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  activateProject,
  archiveProject,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  restoreProject,
  updateProject,
} from "../api/projects.api";
import type { ProjectFormPayload, ProjectListParams } from "../types/project-management.types";

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.projects, params],
    queryFn: () => listProjects(params),
  });
}

export function useProject(projectId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.projects, "detail", projectId],
    queryFn: () => getProject(projectId as number),
    enabled: Boolean(projectId),
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const invalidateProjects = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };

  return {
    create: useMutation({
      mutationFn: (payload: ProjectFormPayload) => createProject(payload),
      onSuccess: async () => {
        toast.success("Project created successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    update: useMutation({
      mutationFn: ({ projectId, payload }: { projectId: number; payload: ProjectFormPayload }) =>
        updateProject(projectId, payload),
      onSuccess: async () => {
        toast.success("Project updated successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    delete: useMutation({
      mutationFn: (projectId: number) => deleteProject(projectId),
      onSuccess: async () => {
        toast.success("Project deleted successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    restore: useMutation({
      mutationFn: (projectId: number) => restoreProject(projectId),
      onSuccess: async () => {
        toast.success("Project restored successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    archive: useMutation({
      mutationFn: (projectId: number) => archiveProject(projectId),
      onSuccess: async () => {
        toast.success("Project archived successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    activate: useMutation({
      mutationFn: (projectId: number) => activateProject(projectId),
      onSuccess: async () => {
        toast.success("Project activated successfully.");
        await invalidateProjects();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

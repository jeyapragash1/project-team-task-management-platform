"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  addProjectMembers,
  getProjectMember,
  listProjectMembers,
  removeProjectMember,
} from "../api/project-members.api";
import type { AddProjectMemberPayload, ProjectMemberListParams } from "../types/project-member-management.types";

export function useProjectMembers(projectId?: number, params: ProjectMemberListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.projectMembers, projectId, params],
    queryFn: () => listProjectMembers(projectId as number, params),
    enabled: Boolean(projectId),
  });
}

export function useProjectMember(projectId?: number, memberId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.projectMembers, projectId, "detail", memberId],
    queryFn: () => getProjectMember(projectId as number, memberId as number),
    enabled: Boolean(projectId && memberId),
  });
}

export function useProjectMemberMutations() {
  const queryClient = useQueryClient();

  const invalidateProjectMembers = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projectMembers });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };

  return {
    add: useMutation({
      mutationFn: ({ projectId, payload }: { projectId: number; payload: AddProjectMemberPayload }) =>
        addProjectMembers(projectId, payload),
      onSuccess: async () => {
        toast.success("Project member added successfully.");
        await invalidateProjectMembers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    remove: useMutation({
      mutationFn: ({ projectId, memberId }: { projectId: number; memberId: number }) =>
        removeProjectMember(projectId, memberId),
      onSuccess: async () => {
        toast.success("Project member removed successfully.");
        await invalidateProjectMembers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

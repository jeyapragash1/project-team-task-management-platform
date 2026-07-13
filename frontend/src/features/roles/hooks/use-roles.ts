"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getRole,
  listRoleOptions,
  listRoles,
  removeRolePermissions,
  updateRole,
} from "../api/roles.api";
import type { PermissionPayload, RoleListParams, RolePayload } from "../types/role-management.types";

export function useRoles() {
  return useQuery({
    queryKey: [...QUERY_KEYS.roles, "options"],
    queryFn: listRoleOptions,
  });
}

export function useRoleList(params: RoleListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.roles, params],
    queryFn: () => listRoles(params),
  });
}

export function useRole(roleId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.roles, "detail", roleId],
    queryFn: () => getRole(roleId as number),
    enabled: Boolean(roleId),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
  };

  return {
    create: useMutation({
      mutationFn: (payload: RolePayload) => createRole(payload),
      onSuccess: async () => {
        toast.success("Role created successfully.");
        await invalidateRoles();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    update: useMutation({
      mutationFn: ({ roleId, payload }: { roleId: number; payload: RolePayload }) => updateRole(roleId, payload),
      onSuccess: async () => {
        toast.success("Role updated successfully.");
        await invalidateRoles();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    delete: useMutation({
      mutationFn: (roleId: number) => deleteRole(roleId),
      onSuccess: async () => {
        toast.success("Role deleted successfully.");
        await invalidateRoles();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    assignPermissions: useMutation({
      mutationFn: ({ roleId, payload }: { roleId: number; payload: PermissionPayload }) =>
        assignRolePermissions(roleId, payload),
      onSuccess: async () => {
        toast.success("Permissions assigned successfully.");
        await invalidateRoles();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    removePermissions: useMutation({
      mutationFn: ({ roleId, payload }: { roleId: number; payload: PermissionPayload }) =>
        removeRolePermissions(roleId, payload),
      onSuccess: async () => {
        toast.success("Permissions removed successfully.");
        await invalidateRoles();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

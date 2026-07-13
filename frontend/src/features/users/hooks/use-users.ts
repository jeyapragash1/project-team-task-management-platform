"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  restoreUser,
  updateUser,
  updateUserStatus,
} from "../api/users.api";
import type { UserFormPayload, UserListParams, UserStatusPayload } from "../types/user-management.types";

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => listUsers(params),
  });
}

export function useUser(userId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, "detail", userId],
    queryFn: () => getUser(userId as number),
    enabled: Boolean(userId),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };

  return {
    create: useMutation({
      mutationFn: (payload: UserFormPayload) => createUser(payload),
      onSuccess: async () => {
        toast.success("User created successfully.");
        await invalidateUsers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    update: useMutation({
      mutationFn: ({ userId, payload }: { userId: number; payload: UserFormPayload }) =>
        updateUser(userId, payload),
      onSuccess: async () => {
        toast.success("User updated successfully.");
        await invalidateUsers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    updateStatus: useMutation({
      mutationFn: ({ userId, payload }: { userId: number; payload: UserStatusPayload }) =>
        updateUserStatus(userId, payload),
      onSuccess: async (_, variables) => {
        toast.success(variables.payload.is_active ? "User activated." : "User deactivated.");
        await invalidateUsers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    delete: useMutation({
      mutationFn: (userId: number) => deleteUser(userId),
      onSuccess: async () => {
        toast.success("User deleted successfully.");
        await invalidateUsers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    restore: useMutation({
      mutationFn: (userId: number) => restoreUser(userId),
      onSuccess: async () => {
        toast.success("User restored successfully.");
        await invalidateUsers();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

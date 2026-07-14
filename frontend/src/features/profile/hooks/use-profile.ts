"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";

import { getProfile, updateProfileDetails, updateProfilePassword } from "../api/profile.api";
import type { ChangePasswordFormValues, ProfileFormValues } from "../schemas/profile.schema";

export function useProfile() {
  return useQuery({
    queryKey: [...QUERY_KEYS.authUser, "profile"],
    queryFn: getProfile,
  });
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  return {
    updateProfile: useMutation({
      mutationFn: (payload: ProfileFormValues) => updateProfileDetails(payload),
      onSuccess: async (user) => {
        queryClient.setQueryData(QUERY_KEYS.authUser, user);
        queryClient.setQueryData([...QUERY_KEYS.authUser, "profile"], user);
        toast.success("Profile updated successfully.");
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authUser });
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
    changePassword: useMutation({
      mutationFn: (payload: ChangePasswordFormValues) => updateProfilePassword(payload),
      onSuccess: () => toast.success("Password changed successfully."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  };
}

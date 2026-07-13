"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QUERY_KEYS, ROUTES } from "@/constants";
import { getApiErrorMessage } from "@/lib/api";
import {
  removeAccessToken,
  setAccessToken,
} from "@/lib/auth/token-storage";

import { getCurrentUser, login, logout } from "../api/auth.api";
import type { LoginPayload } from "../types/auth.types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (data) => {
      setAccessToken(data.token);

      const user = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.authUser,
        queryFn: getCurrentUser,
      });

      queryClient.setQueryData(QUERY_KEYS.authUser, user);
      toast.success("Logged in successfully.");
      router.replace(ROUTES.dashboard);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      removeAccessToken();
      await queryClient.clear();
      router.replace(ROUTES.login);
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

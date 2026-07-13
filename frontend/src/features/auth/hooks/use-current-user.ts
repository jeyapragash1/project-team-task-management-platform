"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { getCurrentUser } from "../api/auth.api";

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.authUser,
    queryFn: getCurrentUser,
    enabled,
  });
}

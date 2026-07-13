"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { listRoles } from "../api/roles.api";

export function useRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.roles,
    queryFn: listRoles,
  });
}

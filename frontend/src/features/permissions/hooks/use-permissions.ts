"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { listAllPermissions, listPermissions } from "../api/permissions.api";
import type { PermissionListParams } from "../types/permission-management.types";

export function usePermissions(params: PermissionListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.permissions, params],
    queryFn: () => listPermissions(params),
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: [...QUERY_KEYS.permissions, "all"],
    queryFn: listAllPermissions,
  });
}

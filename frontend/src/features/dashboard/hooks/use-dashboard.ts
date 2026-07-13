"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { getDashboard } from "../api/dashboard.api";

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: getDashboard,
  });
}

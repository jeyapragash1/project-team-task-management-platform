"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { getReportsDashboard } from "../api/reports.api";
import type { ReportFilters } from "../types/report-management.types";

export function useReportsDashboard(filters: ReportFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.reports, filters],
    queryFn: () => getReportsDashboard(filters),
  });
}

export function useReportsRefresh() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
}

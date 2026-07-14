import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse } from "@/types";

import type { ReportFilters, ReportResponse, ReportsDashboard } from "../types/report-management.types";

function cleanFilters(filters: ReportFilters): ReportFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as ReportFilters;
}

async function getReport(path: string, filters: ReportFilters): Promise<ReportResponse> {
  const response = await apiClient.get<ApiResponse<ReportResponse>>(path, { params: cleanFilters(filters) });

  return response.data.data;
}

export function getUsersReport(filters: ReportFilters): Promise<ReportResponse> {
  return getReport(API_ENDPOINTS.reports.users, filters);
}

export function getProjectsReport(filters: ReportFilters): Promise<ReportResponse> {
  return getReport(API_ENDPOINTS.reports.projects, filters);
}

export function getTasksReport(filters: ReportFilters): Promise<ReportResponse> {
  return getReport(API_ENDPOINTS.reports.tasks, filters);
}

export function getProjectProgressReport(filters: ReportFilters): Promise<ReportResponse> {
  return getReport(API_ENDPOINTS.reports.projectProgress, filters);
}

export function getWorkloadReport(filters: ReportFilters): Promise<ReportResponse> {
  return getReport(API_ENDPOINTS.reports.workload, filters);
}

export async function getReportsDashboard(filters: ReportFilters): Promise<ReportsDashboard> {
  const [users, projects, tasks, projectProgress, workload] = await Promise.all([
    getUsersReport(filters),
    getProjectsReport(filters),
    getTasksReport(filters),
    getProjectProgressReport(filters),
    getWorkloadReport(filters),
  ]);

  return { users, projects, tasks, projectProgress, workload };
}

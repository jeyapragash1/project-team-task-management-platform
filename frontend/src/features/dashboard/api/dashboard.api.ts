import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse } from "@/types";

import type { DashboardResponse } from "../types/dashboard.types";

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<ApiResponse<DashboardResponse>>(
    API_ENDPOINTS.dashboard,
  );

  return response.data.data;
}

import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { PaginatedResponse, Role } from "@/types";

export async function listRoles(): Promise<Role[]> {
  const response = await apiClient.get<PaginatedResponse<Role>>(API_ENDPOINTS.roles, {
    params: {
      per_page: 100,
      sort: "name",
      direction: "asc",
    },
  });

  return response.data.data;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMeta;
};

export type ListQueryParams = {
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

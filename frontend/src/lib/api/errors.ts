import type { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/types";

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ??
    axiosError.message ??
    "Something went wrong. Please try again."
  );
}

export function getValidationErrors(error: unknown): Record<string, string[]> {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return axiosError.response?.data?.errors ?? {};
}

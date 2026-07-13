import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";

export function useApiErrorHandler() {
  return (error: unknown) => {
    toast.error(getApiErrorMessage(error));
  };
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { ROUTES } from "@/constants";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getAccessToken } from "@/lib/auth/token-storage";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = getAccessToken();
  const { data: user, isLoading, isError } = useCurrentUser(Boolean(token));

  useEffect(() => {
    if (!token || isError) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isError, pathname, router, token]);

  if (!token || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  return children;
}

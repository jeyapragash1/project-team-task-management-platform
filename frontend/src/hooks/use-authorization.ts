import { useMemo } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

function getRoleName(role: { name: string } | string): string {
  return typeof role === "string" ? role : role.name;
}

export function useAuthorization() {
  const { data: user } = useCurrentUser();

  return useMemo(() => {
    const permissions = new Set(user?.permissions ?? []);
    const roles = new Set(user?.roles?.map(getRoleName) ?? []);

    return {
      hasPermission: (permission: string) => permissions.has(permission),
      hasAnyPermission: (items: string[]) => items.some((item) => permissions.has(item)),
      hasRole: (role: string) => roles.has(role),
      hasAnyRole: (items: string[]) => items.some((item) => roles.has(item)),
    };
  }, [user]);
}

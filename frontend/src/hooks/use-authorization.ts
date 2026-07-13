import { useMemo } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function useAuthorization() {
  const { data: user } = useCurrentUser();

  return useMemo(() => {
    const permissions = new Set(user?.permissions ?? []);
    const roles = new Set(user?.roles?.map((role) => role.name) ?? []);

    return {
      hasPermission: (permission: string) => permissions.has(permission),
      hasAnyPermission: (items: string[]) => items.some((item) => permissions.has(item)),
      hasRole: (role: string) => roles.has(role),
    };
  }, [user]);
}

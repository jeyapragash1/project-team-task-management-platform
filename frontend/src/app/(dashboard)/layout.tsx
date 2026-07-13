import { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layouts/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

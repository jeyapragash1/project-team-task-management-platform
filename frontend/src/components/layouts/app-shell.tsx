import { ReactNode } from "react";

import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { TopNav } from "@/components/navigation/top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <SidebarNav />
      <div className="min-h-screen lg:pl-72">
        <TopNav />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

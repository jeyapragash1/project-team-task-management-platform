"use client";

import { ReactNode, useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { TopNav } from "@/components/navigation/top-nav";
import { GlobalLoadingIndicator } from "@/components/shared/global-loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalLoadingIndicator />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarNav collapsed={collapsed} onCollapseChange={setCollapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Application navigation</SheetTitle>
            <SheetDescription>Navigate through the dashboard sections.</SheetDescription>
          </SheetHeader>
          <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-16" : "lg:pl-72")}>
        <TopNav onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="px-3 py-5 sm:px-4 lg:px-6">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";

import { sidebarNavigation } from "@/config/navigation";
import { APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";

export function SidebarNav({
  collapsed,
  onCollapseChange,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-3">
        <div className="flex size-9 shrink-0 items-center justify-center border border-sidebar-border bg-background text-foreground">
          <FolderKanban className="size-4" aria-hidden="true" />
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold leading-5">{APP_NAME}</p>
            <p className="truncate text-[11px] text-muted-foreground">Enterprise workspace</p>
          </div>
        ) : null}
        {onCollapseChange ? (
          <button
            type="button"
            className="hidden size-8 shrink-0 items-center justify-center border border-sidebar-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex"
            onClick={() => onCollapseChange(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {sidebarNavigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group flex h-9 items-center gap-3 border border-transparent px-2 text-xs font-medium transition-colors",
                collapsed ? "justify-center" : "justify-start",
                active
                  ? "border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed ? <span className="truncate">{item.title}</span> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

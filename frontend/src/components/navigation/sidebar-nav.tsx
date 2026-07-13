"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarNavigation } from "@/config/navigation";
import { APP_NAME } from "@/constants";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const permissions = new Set(user?.permissions ?? []);

  const visibleItems = sidebarNavigation.filter((item) => {
    if (!item.permissions?.length) {
      return true;
    }

    return item.permissions.some((permission) => permissions.has(permission));
  });

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <span className="text-sm font-semibold leading-5">{APP_NAME}</span>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

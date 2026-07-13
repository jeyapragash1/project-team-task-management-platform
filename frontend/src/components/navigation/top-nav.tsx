"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { data: user } = useCurrentUser();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      <div>
        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
          {user?.name ?? "Authenticated User"}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

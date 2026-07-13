"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { sidebarNavigation } from "@/config/navigation";
import { ROUTES } from "@/constants";

function titleize(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const activeItem = sidebarNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === ROUTES.dashboard) {
    return (
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Home className="size-3.5" aria-hidden="true" />
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <Link href={ROUTES.dashboard} className="inline-flex items-center gap-1 hover:text-foreground">
        <Home className="size-3.5" aria-hidden="true" />
        Dashboard
      </Link>
      <ChevronRight className="size-3" aria-hidden="true" />
      <span className="font-medium text-foreground">
        {activeItem?.title ?? titleize(segments.at(-1) ?? "Page")}
      </span>
    </nav>
  );
}

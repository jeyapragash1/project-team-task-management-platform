"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

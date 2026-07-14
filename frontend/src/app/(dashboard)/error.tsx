"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-12 items-center justify-center border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{error.message || "The dashboard view could not be rendered."}</p>
        <Button type="button" variant="outline" className="mt-5" onClick={reset}>
          <RefreshCcw className="size-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

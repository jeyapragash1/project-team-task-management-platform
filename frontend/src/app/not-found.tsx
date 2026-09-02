import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card>
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">404</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">The page you are looking for does not exist in this workspace.</p>
        <Button variant="outline" className="mt-5" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

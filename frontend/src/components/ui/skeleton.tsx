import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-muted/80 dark:bg-muted/60", className)}
      {...props}
    />
  )
}

export { Skeleton }


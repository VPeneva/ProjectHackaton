import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-muted border-2 border-foreground/20", className)}
      {...props}
    />
  )
}

export { Skeleton }

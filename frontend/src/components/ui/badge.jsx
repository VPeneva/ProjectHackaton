import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 border-foreground px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-none focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "text-foreground bg-transparent",
        pending:
          "bg-[#ff0000] text-white border-black",
        sent:
          "bg-[#ffdd00] text-black border-black",
        finished:
          "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

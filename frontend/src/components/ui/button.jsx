import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold uppercase tracking-wider ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-3 border-foreground hover:bg-foreground hover:text-background",
        destructive:
          "bg-destructive text-destructive-foreground border-3 border-foreground hover:bg-foreground hover:text-background",
        outline:
          "border-3 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
        secondary:
          "bg-secondary text-secondary-foreground border-3 border-foreground hover:bg-primary hover:text-primary-foreground",
        ghost: "hover:bg-muted hover:text-foreground border-3 border-transparent",
        link: "text-foreground underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

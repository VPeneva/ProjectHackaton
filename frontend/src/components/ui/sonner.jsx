import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-3 group-[.toaster]:border-foreground group-[.toaster]:shadow-brutal-sm group-[.toaster]:rounded-none",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-foreground group-[.toast]:font-bold group-[.toast]:uppercase",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-foreground",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-foreground group-[.toast]:hover:bg-foreground group-[.toast]:hover:text-background group-[.toast]:rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

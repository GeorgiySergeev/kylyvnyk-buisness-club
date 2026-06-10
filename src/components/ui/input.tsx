import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-ds-radius-md border border-ds-border bg-ds-surface px-3 py-1.5 text-ds-text-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ds-text placeholder:text-ds-text-muted focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-error aria-invalid:ring-[3px] aria-invalid:ring-ds-error-subtle",
        className
      )}
      {...props}
    />
  )
}

export { Input }

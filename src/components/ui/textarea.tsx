import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-ds-radius-md border border-ds-border bg-ds-surface px-3 py-2 text-ds-text-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none placeholder:text-ds-text-muted focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-error aria-invalid:ring-[3px] aria-invalid:ring-ds-error-subtle",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

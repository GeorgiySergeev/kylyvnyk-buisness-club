"use client"

import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-ds-border transition-[border-color,background-color,box-shadow,opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ds-accent focus-visible:ring-3 focus-visible:ring-ds-accent/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-error aria-invalid:ring-3 aria-invalid:ring-ds-error/20 aria-invalid:aria-checked:border-ds-accent dark:bg-ds-surface/30 dark:aria-invalid:border-ds-error/50 dark:aria-invalid:ring-ds-error/40 data-checked:border-ds-accent data-checked:bg-ds-accent data-checked:text-ds-bg dark:data-checked:bg-ds-accent",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

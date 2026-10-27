// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/input.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(function Input({ className, type, ...props }: React.ComponentProps<"input">, ref: React.ForwardedRef<any>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export { Input }

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/textarea.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(function Textarea({ className, ...props }: React.ComponentProps<"textarea">, ref: React.ForwardedRef<any>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export { Textarea }

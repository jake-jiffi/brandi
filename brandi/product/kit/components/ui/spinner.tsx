// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/spinner.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

import { Loader2Icon } from "lucide-react"

const Spinner = React.forwardRef(function Spinner({ className, ...props }: React.ComponentProps<"svg">, ref: React.ForwardedRef<any>) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
      ref={ref}
    />
  )
})

export { Spinner }

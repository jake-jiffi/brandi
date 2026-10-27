// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/input.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, input): the system's edge. The border is line-control, 3:1 on every surface. Focus is
// a 2px edge, the border in focus plus a 1px ring, in place of the outline. Invalid is a danger edge that stays
// danger when focused. Read-only is a dashed edge. 36px with 14px text; 44px with 16px text on touch, so iOS
// never zooms. data-size picks 32 or 44px (40 or 48 on touch). No viewport breakpoints.
const inputEdge =
  "border border-line-control bg-surface text-text focus-visible:border-focus focus-visible:shadow-[0_0_0_1px_var(--focus)] focus-visible:outline-hidden aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--danger)] disabled:cursor-not-allowed disabled:opacity-50"
const inputSize =
  "h-9 type-body pointer-coarse:h-11 pointer-coarse:type-body-lg data-[size=sm]:h-8 data-[size=sm]:pointer-coarse:h-10 data-[size=lg]:h-11 data-[size=lg]:type-body-lg data-[size=lg]:pointer-coarse:h-12"

/**
 * The same edge drawn on a wrapper that holds a bare input beside an icon, a prefix, a suffix or step buttons:
 * the wrapper takes the focus and danger edges from the input inside it.
 */
export const inputBox =
  "flex w-full min-w-0 items-center gap-2 rounded-control border border-line-control bg-surface px-3 text-text has-[input:focus-visible]:border-focus has-[input:focus-visible]:shadow-[0_0_0_1px_var(--focus)] has-[input[aria-invalid=true]]:border-danger has-[input[aria-invalid=true]:focus-visible]:border-danger has-[input[aria-invalid=true]:focus-visible]:shadow-[0_0_0_1px_var(--danger)] has-[input:read-only:not(:disabled)]:border-dashed has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 " +
  inputSize

/** The input inside an inputBox: no edge of its own, and no outline, because the box draws the focus edge. */
export const inputBare =
  "h-full w-full min-w-0 flex-1 bg-transparent text-text placeholder:text-text-subtle focus-visible:outline-hidden disabled:cursor-not-allowed"

const Input = React.forwardRef(function Input({ className, type, ...props }: React.ComponentProps<"input">, ref: React.ForwardedRef<any>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-control px-3 placeholder:text-text-subtle read-only:not-disabled:border-dashed file:inline-flex file:h-7 file:border-0 file:bg-transparent file:type-label file:text-text",
        inputEdge,
        inputSize,
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export { Input }

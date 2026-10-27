// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/textarea.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(function Textarea({ className, ...props }: React.ComponentProps<"textarea">, ref: React.ForwardedRef<any>) {
  return (
    <textarea
      data-slot="textarea"
      // Patched (07-starter.md, textarea): the input's edge (line-control border, a 2px focus edge, a danger edge
      // that stays danger when focused, dashed when read-only). It starts at 96px, honours rows and resizes
      // vertically. 16px text on touch. No viewport breakpoints.
      className={cn(
        "flex min-h-24 w-full resize-y rounded-control border border-line-control bg-surface px-3 py-2 type-body text-text placeholder:text-text-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_1px_var(--focus)] focus-visible:outline-hidden aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--danger)] read-only:not-disabled:border-dashed disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:type-body-lg",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, textarea): the same edge drawn on a box that holds a bare textarea beside its send button,
// for a composer (AskBar, AskPanel, Conversation): the box takes the 2px focus edge from the textarea inside it.
const textareaBox =
  "flex w-full min-w-0 rounded-control border border-line-control bg-surface text-text has-[textarea:focus-visible]:border-focus has-[textarea:focus-visible]:shadow-[0_0_0_1px_var(--focus)] has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:opacity-50"

// Patched (07-starter.md, textarea): the textarea inside a textareaBox. No edge and no outline of its own, because the
// box draws the focus edge, and no handle, because it grows with its lines. 16px text on touch.
const textareaBare =
  "block w-full min-w-0 resize-none bg-transparent type-body text-text placeholder:text-text-subtle focus-visible:outline-hidden disabled:cursor-not-allowed pointer-coarse:type-body-lg"

export { Textarea, textareaBox, textareaBare }

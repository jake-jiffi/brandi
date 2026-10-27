// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/button.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// Patched (07-starter.md, button): the system's variants and shape, touch sizes, and a disabled state
// that keeps pointer events, so a tooltip can still say why. Focus is the base styles' outline.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-action border border-transparent bg-clip-padding type-label whitespace-nowrap transition-colors select-none active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-invalid:border-danger-line [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-pressed",
        outline: "border-line-control bg-surface text-text-strong hover:bg-hover active:bg-pressed aria-expanded:bg-pressed",
        secondary: "border-line-control bg-surface text-text-strong hover:bg-hover active:bg-pressed aria-expanded:bg-pressed",
        ghost: "text-text-strong hover:bg-hover active:bg-pressed aria-expanded:bg-pressed",
        brand: "bg-brand text-on-brand hover:bg-brand-hover",
        destructive: "border-danger-line bg-danger-surface text-danger hover:bg-hover active:bg-pressed",
        "destructive-solid": "bg-danger-solid text-on-danger hover:opacity-90 active:opacity-80",
        link: "h-auto rounded-none px-0 text-link underline underline-offset-4 hover:text-link-hover",
      },
      size: {
        default: "h-9 px-3.5 pointer-coarse:h-11",
        xs: "h-7 gap-1 px-2 type-meta pointer-coarse:h-10 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1 px-3 pointer-coarse:h-10",
        lg: "h-11 px-5 pointer-coarse:h-12",
        icon: "size-9 pointer-coarse:size-11",
        "icon-xs": "size-7 pointer-coarse:size-10 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 pointer-coarse:size-10",
        "icon-lg": "size-11 pointer-coarse:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }, ref: React.ForwardedRef<any>) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      ref={ref}
    />
  )
})

export { Button, buttonVariants }

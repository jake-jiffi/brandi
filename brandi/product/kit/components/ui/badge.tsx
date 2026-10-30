// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/badge.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// Patched (07-starter.md, badge): gentle corners, never the pressable shape, because a badge is read and
// not pressed. The system's status tones, two sizes, the type style, and an optional dot (BadgeDot). The
// stock variants stay so code written against shadcn still renders.
// Where people read (Root's reading), the caption takes the 16px floor, so the badge grows to hold it rather than
// keeping its 24px height with the words touching its edges.
const badgeVariants = cva(
  "group/badge inline-flex w-fit max-w-full min-w-0 shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent type-caption whitespace-nowrap transition-colors [[data-reading]_&]:h-auto [[data-reading]_&]:py-1 [[data-reading]_&]:leading-5 has-[>[data-slot=badge-dot]:first-child]:pl-1.5 has-[>[data-slot=icon]:first-child]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        neutral: "border-line bg-tag-grey text-text-muted",
        success: "border-success-line bg-success-surface text-success",
        warning: "border-warning-line bg-warning-surface text-warning",
        danger: "border-danger-line bg-danger-surface text-danger",
        info: "border-info-line bg-info-surface text-info",
        ai: "border-ai-line bg-ai-surface text-ai",
        // "Needs you" is solid, so it never blurs with the tinted warning (round 1).
        highlight: "bg-highlight text-on-highlight",
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-5 px-1.5",
        md: "h-6 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const Badge = React.forwardRef(function Badge({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }, ref: React.ForwardedRef<any>) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, badge): the dot, in the badge's own text colour. Forced colours draw it in
// CanvasText (the base styles' badge-dot rule), so it never vanishes with the tint.
const BadgeDot = React.forwardRef(function BadgeDot({ className, ...props }: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return <span data-slot="badge-dot" aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} {...props} ref={ref} />
})

export { Badge, BadgeDot, badgeVariants }

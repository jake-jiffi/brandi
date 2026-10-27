// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/empty.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, empty): the system's corners, no dashed box (dashes mean "drop here"), and a group,
// so the title and body can take the size the root names in data-size (page, section or compact).
const Empty = React.forwardRef(function Empty({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "group/empty flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-md p-12 text-center text-balance",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const EmptyHeader = React.forwardRef(function EmptyHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, empty): the icon sits in flow in a quiet role colour, with no tile of its own. A
// rounded tile above a heading is the generic feature-card template, and the detector flags it.
const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "text-text-muted [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const EmptyMedia = React.forwardRef(function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, empty): a real heading through `as`, so a page keeps its outline, in the system's
// type: the display style for a page, the large heading in a section, the heading when compact. Each sits at
// least a 1.25 step above its body, so the title is the one thing the eye lands on. Long unbroken words wrap
// here and in the body.
const EmptyTitle = React.forwardRef(function EmptyTitle({
  className,
  as: Heading = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" }, ref: React.ForwardedRef<any>) {
  return (
    <Heading
      data-slot="empty-title"
      className={cn(
        "m-0 type-heading-lg wrap-break-word text-text-strong group-data-[size=page]/empty:type-title group-data-[size=compact]/empty:type-heading",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, empty): body text and links in role tokens, sized with the root.
const EmptyDescription = React.forwardRef(function EmptyDescription({ className, ...props }: React.ComponentProps<"p">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "type-body wrap-break-word text-text-muted group-data-[size=page]/empty:type-body-lg group-data-[size=compact]/empty:type-meta [&>a]:text-link [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-link-hover",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, empty): the system's body type.
const EmptyContent = React.forwardRef(function EmptyContent({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 type-body text-balance",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}

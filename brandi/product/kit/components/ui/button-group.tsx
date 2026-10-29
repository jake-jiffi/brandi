// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/button-group.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-action [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-action!",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-action!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

const ButtonGroup = React.forwardRef(function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
      ref={ref}
    />
  )
})

const ButtonGroupText = React.forwardRef(function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}, ref: React.ForwardedRef<any>) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-action border bg-muted px-2.5 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ButtonGroupSeparator = React.forwardRef(function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>, ref: React.ForwardedRef<any>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}

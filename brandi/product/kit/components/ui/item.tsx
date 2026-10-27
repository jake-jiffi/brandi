// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/item.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import { Separator } from "@/components/ui/separator"

const ItemGroup = React.forwardRef(function ItemGroup({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ItemSeparator = React.forwardRef(function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>, ref: React.ForwardedRef<any>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, item): the system's body type and text role, and the hover wash on a linked item, in
// place of shadcn's text-sm and muted fill.
const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-md border type-body text-text transition-colors duration-100 [a]:transition-colors [a]:hover:bg-hover",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-3.5 px-4 py-3.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Item = React.forwardRef(function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }, ref: React.ForwardedRef<any>) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
      ref={ref}
    />
  )
})

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ItemMedia = React.forwardRef(function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
      ref={ref}
    />
  )
})

const ItemContent = React.forwardRef(function ItemContent({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ItemTitle = React.forwardRef(function ItemTitle({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ItemDescription = React.forwardRef(function ItemDescription({ className, ...props }: React.ComponentProps<"p">, ref: React.ForwardedRef<any>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ItemActions = React.forwardRef(function ItemActions({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})

const ItemHeader = React.forwardRef(function ItemHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const ItemFooter = React.forwardRef(function ItemFooter({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}

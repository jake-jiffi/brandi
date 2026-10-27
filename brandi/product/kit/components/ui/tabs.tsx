"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/tabs.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

const Tabs = React.forwardRef(function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>, ref: React.ForwardedRef<any>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, tabs): underline by default, because a grey pill row reads as a segmented
// control. The line row runs full width and scrolls sideways when the tabs do not fit; the hairline
// under it is inset, so the selected tab's underline covers it.
const tabsListVariants = cva(
  "group/tabs-list items-center text-text-muted group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "inline-flex w-fit gap-1 rounded-control bg-surface-sunken p-1",
        line: "flex w-full justify-start overflow-x-auto no-scrollbar shadow-[inset_0_-1px_0_var(--line)]",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
)

const TabsList = React.forwardRef(function TabsList({
  className,
  variant = "line",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>, ref: React.ForwardedRef<any>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
      ref={ref}
    />
  )
})

const TabsTrigger = React.forwardRef(function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Patched (07-starter.md, tabs): 40px tall on every pointer, the selected tab in text-strong with a
        // 2px primary underline drawn by ::after (forced colours paint it Highlight), and focus drawn
        // inside the tab, because the row scrolls sideways and would clip a ring drawn outside it.
        "relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm px-3 type-label whitespace-nowrap text-text-muted transition-colors duration-(--duration-fast) group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-text-strong focus-visible:outline-offset-[-2px] disabled:pointer-events-none disabled:opacity-50 data-active:text-text-strong [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:h-8 group-data-[variant=default]/tabs-list:rounded-control group-data-[variant=default]/tabs-list:data-active:bg-surface group-data-[variant=default]/tabs-list:data-active:shadow-xs",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:inset-x-3 group-data-[variant=line]/tabs-list:after:bottom-0 group-data-[variant=line]/tabs-list:after:h-0.5 group-data-[variant=line]/tabs-list:after:rounded-full group-data-[variant=line]/tabs-list:hover:after:bg-line-strong group-data-[variant=line]/tabs-list:data-active:after:bg-primary",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const TabsContent = React.forwardRef(function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>, ref: React.ForwardedRef<any>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      // Patched (07-starter.md, tabs): the panel takes focus with its own ring and sets no type of its own.
      className={cn("flex-1 rounded-sm", className)}
      {...props}
      ref={ref}
    />
  )
})

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/input-group.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const InputGroup = React.forwardRef(function InputGroup({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      // Patched (07-starter.md, input-group): the input's edge in place of the stock 3px glow, which drew a second
      // ring: line-control border, a 2px focus edge (the border in focus plus a 1px ring), a danger edge that stays
      // danger when focused, 44px on touch.
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-control border border-line-control bg-surface pointer-coarse:h-11 in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-focus has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_0_0_1px_var(--focus)] has-[[data-slot][aria-invalid=true]]:border-danger has-[[data-slot][aria-invalid=true]:focus-visible]:border-danger has-[[data-slot][aria-invalid=true]:focus-visible]:shadow-[0_0_0_1px_var(--danger)] has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[max(calc(var(--radius-control)-2px),0px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:-ml-1 has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:-mr-1 has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

const InputGroupAddon = React.forwardRef(function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
      ref={ref}
    />
  )
})

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[max(calc(var(--radius-control)-2px),0px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs":
          "size-6 rounded-[max(calc(var(--radius-control)-2px),0px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

const InputGroupButton = React.forwardRef(function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>, ref: React.ForwardedRef<any>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
      ref={ref}
    />
  )
})

const InputGroupText = React.forwardRef(function InputGroupText({ className, ...props }: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const InputGroupInput = React.forwardRef(function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">, ref: React.ForwardedRef<any>) {
  return (
    <Input
      data-slot="input-group-control"
      // Patched (07-starter.md, input-group): the group draws the focus and danger edges, so the input inside
      // draws none of its own.
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:shadow-none aria-invalid:focus-visible:shadow-none dark:bg-transparent",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const InputGroupTextarea = React.forwardRef(function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">, ref: React.ForwardedRef<any>) {
  return (
    <Textarea
      data-slot="input-group-control"
      // Patched (07-starter.md, input-group): the group draws the focus and danger edges.
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:shadow-none aria-invalid:focus-visible:shadow-none dark:bg-transparent",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}

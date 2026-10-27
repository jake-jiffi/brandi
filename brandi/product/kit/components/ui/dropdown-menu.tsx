"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/dropdown-menu.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { CheckIcon, ChevronRightIcon } from "lucide-react"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

const DropdownMenuTrigger = React.forwardRef(function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, dropdown-menu): the system's material and a layer above dialogs and sheets,
// so a menu opened inside one shows over it. As wide as its trigger at least, 192px at least, and
// moving only under motion-safe. It closes at once, because Radix keeps a layer live while an exit
// animation plays and an Escape pressed during it would be swallowed. Shared with a menu drawn in place.
const dropdownMenuPanelClass =
  "min-w-[max(12rem,var(--radix-dropdown-menu-trigger-width,0px))] max-w-80 overflow-x-hidden overflow-y-auto rounded-md border border-line bg-surface-raised p-1 text-text shadow-md"

const DropdownMenuContent = React.forwardRef(function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          dropdownMenuPanelClass,
          "z-(--z-popover) max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) animation-duration-(--duration-base) ease-standard data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 motion-safe:data-open:zoom-in-95 data-[side=bottom]:motion-safe:slide-in-from-top-2 data-[side=left]:motion-safe:slide-in-from-right-2 data-[side=right]:motion-safe:slide-in-from-left-2 data-[side=top]:motion-safe:slide-in-from-bottom-2",
          className
        )}
        {...props}
      ref={ref}
      />
    </DropdownMenuPrimitive.Portal>
  )
})

// Patched (07-starter.md, dropdown-menu): the option in hand takes the hover tint and a 1px inset edge
// in line-control, and from the keyboard a 2px ring drawn inside it, because the menu scrolls and would
// clip one drawn outside. 36px tall, 44px on touch. Destructive options in danger text. Disabled
// options stay visible and do nothing. Shared with a menu drawn in place on a canvas.
const dropdownMenuItemClass =
  "group/dropdown-menu-item relative flex min-h-9 items-center gap-2.5 rounded-control px-2.5 py-1.5 type-body text-text select-none focus-visible:outline-offset-[-2px] data-highlighted:bg-hover data-highlighted:shadow-[inset_0_0_0_1px_var(--line-control)] data-inset:pl-9 data-[variant=destructive]:text-danger data-disabled:pointer-events-none data-disabled:opacity-50 pointer-coarse:min-h-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
const dropdownMenuLabelClass = "px-2.5 pt-2.5 pb-1 type-eyebrow text-text-subtle data-inset:pl-9"
const dropdownMenuSeparatorClass = "-mx-1 my-1 h-px bg-line"

const DropdownMenuGroup = React.forwardRef(function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props}
      ref={ref} />
  )
})

const DropdownMenuItem = React.forwardRef(function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(dropdownMenuItemClass, className)}
      {...props}
      ref={ref}
    />
  )
})

const DropdownMenuCheckboxItem = React.forwardRef(function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(dropdownMenuItemClass, className)}
      checked={checked}
      {...props}
      ref={ref}
    >
      {/* Patched (07-starter.md, dropdown-menu): the check leads, in the icon's place, so labels line up. */}
      <span
        className="pointer-events-none flex size-4 shrink-0 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})

const DropdownMenuRadioGroup = React.forwardRef(function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
      ref={ref}
    />
  )
})

const DropdownMenuRadioItem = React.forwardRef(function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean
}, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(dropdownMenuItemClass, className)}
      {...props}
      ref={ref}
    >
      {/* Patched (07-starter.md, dropdown-menu): the check leads, in the icon's place, so labels line up. */}
      <span
        className="pointer-events-none flex size-4 shrink-0 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
})

const DropdownMenuLabel = React.forwardRef(function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      // Patched (07-starter.md, dropdown-menu): group labels in the eyebrow style, lined up with the options' text.
      className={cn(dropdownMenuLabelClass, className)}
      {...props}
      ref={ref}
    />
  )
})

const DropdownMenuSeparator = React.forwardRef(function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      // Patched (07-starter.md, dropdown-menu): the system's hairline.
      className={cn(dropdownMenuSeparatorClass, className)}
      {...props}
      ref={ref}
    />
  )
})

const DropdownMenuShortcut = React.forwardRef(function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

const DropdownMenuSubTrigger = React.forwardRef(function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      // Patched (07-starter.md, dropdown-menu): an option like the others, in hand while its menu is open.
      className={cn(dropdownMenuItemClass, "data-open:bg-hover", className)}
      {...props}
      ref={ref}
    >
      {children}
      <ChevronRightIcon
        className="cn-rtl-flip ml-auto"
      />
    </DropdownMenuPrimitive.SubTrigger>
  )
})

const DropdownMenuSubContent = React.forwardRef(function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>, ref: React.ForwardedRef<any>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      // Patched (07-starter.md, dropdown-menu): the same material and layer as the menu it opened from.
      className={cn(
        dropdownMenuPanelClass,
        "z-(--z-popover) origin-(--radix-dropdown-menu-content-transform-origin) animation-duration-(--duration-base) ease-standard data-open:animate-in data-open:fade-in-0 motion-safe:data-open:zoom-in-95",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  // Patched (07-starter.md, dropdown-menu): the classes a menu drawn in place on a canvas shares.
  dropdownMenuItemClass,
  dropdownMenuLabelClass,
  dropdownMenuPanelClass,
  dropdownMenuSeparatorClass,
}

"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/command.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { CheckIcon, SearchIcon } from "lucide-react"

const Command = React.forwardRef(function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {/* Patched (07-starter.md, command): near the top on every screen, through the dialog's own placement. */}
      <DialogContent
        placement="top"
        className={cn(
          "overflow-hidden p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef(function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>, ref: React.ForwardedRef<any>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! rounded-control! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-sm disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
      ref={ref}
        />
        <InputGroupAddon>
          <SearchIcon
            className="size-4 shrink-0 opacity-50"
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
})

const CommandList = React.forwardRef(function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CommandEmpty = React.forwardRef(function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
      ref={ref}
    />
  )
})

const CommandGroup = React.forwardRef(function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CommandSeparator = React.forwardRef(function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px w-auto bg-border", className)}
      {...props}
      ref={ref}
    />
  )
})

const CommandItem = React.forwardRef(function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>, ref: React.ForwardedRef<any>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none in-data-[slot=dialog-content]:rounded-control! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:**:[svg]:text-foreground",
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
      <CheckIcon
        className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
    </CommandPrimitive.Item>
  )
})

const CommandShortcut = React.forwardRef(function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

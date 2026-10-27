"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/table.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(function Table({
  className,
  containerRef,
  containerProps,
  ...props
}: React.ComponentProps<"table"> & {
  containerRef?: React.Ref<HTMLDivElement>
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}, ref: React.ForwardedRef<any>) {
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      {...containerProps}
      // Patched (07-starter.md, table): the scroll box takes a ref and props of its own (a name, a tab stop, a
      // maximum height), so a table wider or taller than its box becomes a region the keyboard can scroll.
      className={cn("relative w-full overflow-x-auto", containerProps?.className)}
    >
      <table
        data-slot="table"
        // Patched (07-starter.md, table): the system's body type in tabular figures, so numbers line up down a
        // column. Separate borders, so a sticky head keeps its hairline as the rows scroll under it.
        className={cn("w-full caption-bottom border-separate border-spacing-0 type-body text-text tabular-nums", className)}
        {...props}
      ref={ref}
      />
    </div>
  )
})

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }: React.ComponentProps<"thead">, ref: React.ForwardedRef<any>) {
  return (
    <thead
      data-slot="table-header"
      // Patched (07-starter.md, table): the head's hairline is drawn by its cells (TableHead), which keep it
      // when the head sticks.
      className={className}
      {...props}
      ref={ref}
    />
  )
})

const TableBody = React.forwardRef(function TableBody({ className, ...props }: React.ComponentProps<"tbody">, ref: React.ForwardedRef<any>) {
  return (
    <tbody
      data-slot="table-body"
      // Patched (07-starter.md, table): hairlines sit on the cells, so the last row drops its own.
      className={cn("[&>tr:last-child>td]:border-b-0", className)}
      {...props}
      ref={ref}
    />
  )
})

const TableFooter = React.forwardRef(function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">, ref: React.ForwardedRef<any>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const TableRow = React.forwardRef(function TableRow({ className, ...props }: React.ComponentProps<"tr">, ref: React.ForwardedRef<any>) {
  return (
    <tr
      data-slot="table-row"
      // Patched (07-starter.md, table): rows at the system's row height, with no zebra stripes. The row's wash
      // is a variable, so a sticky cell can paint the same wash over an opaque surface: the hover wash, the
      // selected tint, and the stronger tint for a selected row under the pointer.
      className={cn(
        "group/row h-(--row) bg-(--row-wash) transition-colors [--row-wash:transparent] hover:[--row-wash:var(--hover)] has-aria-expanded:[--row-wash:var(--hover)] data-[state=selected]:[--row-wash:var(--selected)] data-[state=selected]:hover:[--row-wash:var(--selected-strong)]",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const TableHead = React.forwardRef(function TableHead({ className, ...props }: React.ComponentProps<"th">, ref: React.ForwardedRef<any>) {
  return (
    <th
      data-slot="table-head"
      // Patched (07-starter.md, table): the head on surface-subtle in the eyebrow style, short uppercase labels
      // over a hairline, 16px in from the table's edges.
      className={cn(
        "h-10 border-b border-line bg-surface-subtle px-3 text-left align-middle type-eyebrow whitespace-nowrap text-text-muted first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const TableCell = React.forwardRef(function TableCell({ className, ...props }: React.ComponentProps<"td">, ref: React.ForwardedRef<any>) {
  return (
    <td
      data-slot="table-cell"
      // Patched (07-starter.md, table): a hairline between rows, 16px in from the table's edges.
      className={cn(
        "border-b border-line px-3 align-middle whitespace-nowrap first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const TableCaption = React.forwardRef(function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">, ref: React.ForwardedRef<any>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
      ref={ref}
    />
  )
})

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/table.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(function Table({ className, ...props }: React.ComponentProps<"table">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
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
      className={cn("[&_tr]:border-b", className)}
      {...props}
      ref={ref}
    />
  )
})

const TableBody = React.forwardRef(function TableBody({ className, ...props }: React.ComponentProps<"tbody">, ref: React.ForwardedRef<any>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
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
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
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
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
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
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
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

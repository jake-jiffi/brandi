// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/breadcrumb.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

const Breadcrumb = React.forwardRef(function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">, ref: React.ForwardedRef<any>) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbList = React.forwardRef(function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">, ref: React.ForwardedRef<any>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbItem = React.forwardRef(function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">, ref: React.ForwardedRef<any>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbLink = React.forwardRef(function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}, ref: React.ForwardedRef<any>) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbPage = React.forwardRef(function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbSeparator = React.forwardRef(function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">, ref: React.ForwardedRef<any>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
      ref={ref}
    >
      {children ?? (
        <ChevronRightIcon
          className="cn-rtl-flip"
        />
      )}
    </li>
  )
})

const BreadcrumbEllipsis = React.forwardRef(function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
      ref={ref}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
})

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

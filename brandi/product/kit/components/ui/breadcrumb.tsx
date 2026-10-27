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
      // Patched (07-starter.md, breadcrumb): a nav named Breadcrumb, in sentence case.
      aria-label="Breadcrumb"
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
        // Patched (07-starter.md, breadcrumb): the system's type, and one gap at every width (no viewport query).
        "flex flex-wrap items-center gap-x-1.5 gap-y-1 type-body wrap-break-word text-text-muted",
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
      // Patched (07-starter.md, breadcrumb): a 24px target on every pointer, the WCAG minimum for a link in a trail.
      className={cn("inline-flex min-h-6 items-center rounded-xs underline-offset-4 transition-colors duration-(--duration-fast) hover:text-text-strong hover:underline", className)}
      {...props}
      ref={ref}
    />
  )
})

const BreadcrumbPage = React.forwardRef(function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="breadcrumb-page"
      // Patched (07-starter.md, breadcrumb): the current page is plain text with aria-current, not a disabled link.
      aria-current="page"
      className={cn("inline-flex min-h-6 items-center text-text", className)}
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
      // Patched (07-starter.md, breadcrumb): the separator in the subtle text colour.
      className={cn("flex text-text-subtle [&>svg]:size-3.5", className)}
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

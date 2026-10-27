// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/pagination.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

const Pagination = React.forwardRef(function Pagination({ className, ...props }: React.ComponentProps<"nav">, ref: React.ForwardedRef<any>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
      ref={ref}
    />
  )
})

const PaginationContent = React.forwardRef(function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">, ref: React.ForwardedRef<any>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
      ref={ref}
    />
  )
})

const PaginationItem = React.forwardRef(function PaginationItem({ ...props }: React.ComponentProps<"li">, ref: React.ForwardedRef<any>) {
  return <li data-slot="pagination-item" {...props}
      ref={ref} />
})

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

const PaginationLink = React.forwardRef(function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps, ref: React.ForwardedRef<any>) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      ref={ref}
      />
    </Button>
  )
})

const PaginationPrevious = React.forwardRef(function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }, ref: React.ForwardedRef<any>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-2!", className)}
      {...props}
      ref={ref}
    >
      <ChevronLeftIcon
        data-icon="inline-start"
        className="cn-rtl-flip"
      />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
})

const PaginationNext = React.forwardRef(function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }, ref: React.ForwardedRef<any>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-2!", className)}
      {...props}
      ref={ref}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon
        data-icon="inline-end"
        className="cn-rtl-flip"
      />
    </PaginationLink>
  )
})

const PaginationEllipsis = React.forwardRef(function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={ref}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
})

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

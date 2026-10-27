"use client"

import * as React from "react"

import { Pagination as PaginationBase, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Button } from "./button"

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** The current page, from 1. Keep it in the URL. */
  page: number
  /** Rows per page. Keep the size the person chose. */
  pageSize?: number
  total: number
  onPage?: (page: number) => void
}

/** The footer of a long table: where you are, in words, with previous and next. */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageSize = 25, total, onPage, className, ...rest },
  ref
) {
  // A board passes attributes as strings, so anything that is not a number reads as the default.
  const size = Math.max(1, Math.floor(Number(pageSize)) || 25)
  const count = Math.max(0, Math.floor(Number(total)) || 0)
  const pages = Math.max(1, Math.ceil(count / size))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages)
  const first = (current - 1) * size + 1
  const last = Math.min(current * size, count)
  const where =
    count === 0
      ? "No results"
      : `${formatNumber(first, "number")} to ${formatNumber(last, "number")} of ${formatNumber(count, "number")}`
  const go = (to: number) => {
    if (to >= 1 && to <= pages && to !== current) onPage?.(to)
  }

  return (
    <PaginationBase
      ref={ref}
      className={cn("mx-0 flex-wrap items-center justify-between gap-x-4 gap-y-2", className)}
      {...rest}
    >
      {/* Polite, so a new page is read out when it changes and never on load. */}
      <p role="status" data-slot="pagination-range" className="type-body text-text-muted tabular-nums">
        {where}
      </p>
      {pages > 1 ? (
        <PaginationContent className="ml-auto gap-2">
          {/* At either end the button stays focusable and says it is unavailable, so focus never drops. */}
          <PaginationItem>
            <Button size="sm" icon="ChevronLeft" aria-disabled={current <= 1 || undefined} onClick={() => go(current - 1)}>
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button size="sm" iconRight="ChevronRight" aria-disabled={current >= pages || undefined} onClick={() => go(current + 1)}>
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      ) : null}
    </PaginationBase>
  )
})

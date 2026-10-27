"use client"

import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

/** One step of the trail. The last is the current page and needs no `href`. */
export interface Crumb {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  /** From the top of the product down to the current page, which comes last. */
  items: Crumb[]
  className?: string
}

const CUT = 28

/**
 * A name past 28 characters is cut, at a word break when there is one near the end, and the full name
 * stays reachable without a mouse: it is the link's accessible name, it shows in full while the link
 * has keyboard focus, and a touch screen never cuts it.
 */
function CutName({ label }: { label: string }) {
  if (label.length <= CUT) return <>{label}</>
  const space = label.lastIndexOf(" ", CUT - 1)
  return (
    <>
      <span aria-hidden="true" className="group-focus-visible/crumb:hidden pointer-coarse:hidden">
        {`${label.slice(0, space > CUT - 10 ? space : CUT - 1).trimEnd()}…`}
      </span>
      <span className="sr-only group-focus-visible/crumb:not-sr-only pointer-coarse:not-sr-only">{label}</span>
    </>
  )
}

/** Where a record sits, for pages two or more levels deep. */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs({ items, className }, ref) {
  const Link = useLink()
  return (
    <Breadcrumb ref={ref} className={cn("min-w-0", className)}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <React.Fragment key={`${i}-${item.label}`}>
              <BreadcrumbItem className="min-w-0">
                {last ? (
                  // The current page is never cut: it wraps, and it repeats the page's title.
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="group/crumb" title={item.label.length > CUT ? item.label : undefined}>
                      <CutName label={item.label} />
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="inline-flex min-h-6 items-center">
                    <CutName label={item.label} />
                  </span>
                )}
              </BreadcrumbItem>
              {last ? null : (
                <BreadcrumbSeparator>
                  <Icon name="ChevronRight" size={14} />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
})

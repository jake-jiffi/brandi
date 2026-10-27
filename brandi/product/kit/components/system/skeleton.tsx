import * as React from "react"

import { Skeleton as SkeletonBase } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const length = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v)

export interface SkeletonProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** px, or any CSS length. The full width by default. */
  width?: number | string
  /** px, or any CSS length. 16px by default. Lines set their own. */
  height?: number | string
  /** A circle the width across (or the height, or 40px), in an avatar's place. */
  circle?: boolean
  /** Lines of text: 12px bars on the body text's 20px rhythm, the last one shorter, so nothing jumps when the words arrive. */
  lines?: number
  /** Said to screen readers once, as a polite status: "Loading clients". The shapes themselves are hidden. Give it to one skeleton per area. */
  label?: string
}

/** Grey shapes where content is about to appear, in that content's layout. */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height, circle = false, lines, label, className, style, ...rest },
  ref
) {
  let shapes: React.ReactNode
  if (lines && lines > 0) {
    shapes = Array.from({ length: lines }, (_, i) => (
      <SkeletonBase key={i} className="h-3 rounded-xs" style={{ width: lines > 1 && i === lines - 1 ? "60%" : "100%" }} />
    ))
  } else if (circle) {
    const across = length(width ?? height ?? 40)
    shapes = <SkeletonBase className="shrink-0 rounded-full" style={{ width: across, height: across }} />
  } else {
    shapes = <SkeletonBase style={{ width: length(width) ?? "100%", height: length(height) ?? "1rem" }} />
  }
  return (
    // appear-late keeps the shapes away for the first second, so a quick load shows nothing at all.
    <div
      ref={ref}
      data-slot="skeleton-group"
      className={cn("appear-late flex flex-col", lines ? "gap-2 py-1" : undefined, className)}
      style={lines && width !== undefined ? { width: length(width), ...style } : style}
      {...rest}
    >
      {shapes}
      {label ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
    </div>
  )
})

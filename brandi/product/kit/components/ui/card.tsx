// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/card.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, card): radius-md, a hairline and shadow-sm on the surface role, and `as`
// for a section, an article or a list item. Patched (07-starter.md, card): overflow-clip, not overflow-hidden.
// Both clip the corners, but a hidden box is a scroll container, whose automatic minimum size is 0, so in a
// short column that scrolls (a phone's main) the card shrank to fit and cut off its own content.
const Card = React.forwardRef(function Card({
  className,
  size = "default",
  as = "div",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm"; as?: "div" | "section" | "article" | "li" }, ref: React.ForwardedRef<any>) {
  // Each takes the same attributes as a div; the cast keeps TypeScript from unioning four element types.
  const Comp = as as "div"
  return (
    <Comp
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-clip rounded-md border border-line bg-surface py-(--card-spacing) text-text shadow-sm [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-md *:[img:last-child]:rounded-b-md",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-header"
      // Patched (07-starter.md, card): its corners follow the card's radius-md.
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-md px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, card): the title is a real heading, an h2, with `as` for h3 and h4, so a card
// sits in the page's outline under its one h1. Its size follows its level, so the outline shows on
// screen too: heading-lg for a section of the page, heading for a card under one, heading-sm below.
const TITLE_SIZE = { h2: "type-heading-lg", h3: "type-heading", h4: "type-heading-sm" } as const
const CardTitle = React.forwardRef(function CardTitle({
  className,
  as: Heading = "h2",
  ...props
}: React.ComponentProps<"h2"> & { as?: "h2" | "h3" | "h4" }, ref: React.ForwardedRef<any>) {
  return (
    <Heading
      data-slot="card-title"
      className={cn(
        TITLE_SIZE[Heading],
        "text-text-strong group-data-[size=sm]/card:type-heading-sm",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-description"
      // Patched (07-starter.md, card): the body style in the muted role.
      className={cn("type-body text-text-muted", className)}
      {...props}
      ref={ref}
    />
  )
})

const CardAction = React.forwardRef(function CardAction({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CardContent = React.forwardRef(function CardContent({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-3 px-(--card-spacing)", className)}
      {...props}
      ref={ref}
    />
  )
})

const CardFooter = React.forwardRef(function CardFooter({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-footer"
      // Patched (07-starter.md, card): its corners follow the card's radius-md.
      className={cn(
        "flex items-center rounded-b-md px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

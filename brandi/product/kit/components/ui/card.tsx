// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/card.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
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
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const CardTitle = React.forwardRef(function CardTitle({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "cn-font-heading text-base leading-normal font-medium group-data-[size=sm]/card:text-sm",
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
      className={cn("text-sm text-muted-foreground", className)}
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
      className={cn(
        "flex items-center rounded-b-xl px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
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

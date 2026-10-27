"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/avatar.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar as AvatarPrimitive } from "radix-ui"

// Patched (07-starter.md, avatar): a 28px size ("md") between 24 and 32, so the system's four sizes are
// 24, 28, 32 and 40.
const Avatar = React.forwardRef(function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "md" | "lg"
}, ref: React.ForwardedRef<any>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=md]:size-7 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const AvatarImage = React.forwardRef(function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>, ref: React.ForwardedRef<any>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const AvatarFallback = React.forwardRef(function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, avatar): initials in bold on a tag tint, in the strong text colour, sized to
    // the circle. The system's Avatar picks the tint from the name.
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-tag-grey type-heading-sm text-text-strong group-data-[size=lg]/avatar:type-heading group-data-[size=md]/avatar:type-eyebrow group-data-[size=sm]/avatar:type-eyebrow",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const AvatarBadge = React.forwardRef(function AvatarBadge({ className, ...props }: React.ComponentProps<"span">, ref: React.ForwardedRef<any>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const AvatarGroup = React.forwardRef(function AvatarGroup({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="avatar-group"
      // Patched (07-starter.md, avatar): the ring that parts overlapping avatars is the surface they sit on.
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-surface",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const AvatarGroupCount = React.forwardRef(function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="avatar-group-count"
      // Patched (07-starter.md, avatar): the count matches the initials beside it, at all four sizes.
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-tag-grey type-heading-sm text-text-strong ring-2 ring-surface group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=lg]/avatar-group:type-heading group-has-data-[size=md]/avatar-group:size-7 group-has-data-[size=md]/avatar-group:type-eyebrow group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=sm]/avatar-group:type-eyebrow [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

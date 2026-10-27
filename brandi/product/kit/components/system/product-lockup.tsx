"use client"

import * as React from "react"

import { BRAND } from "@/lib/brand"
import { useLink } from "@/lib/link"
import { PRODUCT } from "@/lib/product"
import { cn } from "@/lib/utils"

import { Logo, type LogoColor } from "./logo"

export interface ProductLockupProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** The product's name as people say it. Defaults to the name in lib/product.ts. */
  product?: string
  /** As Logo. With `ink`, the name takes the text colour around it too. */
  color?: LogoColor
  /** `inline`, with a hairline between mark and name, or `stacked`, the name under the mark. */
  layout?: "inline" | "stacked"
  /** The mark's height in px, the logo system's preferred size by default. */
  height?: number
  /** Makes the whole lockup one link, named "[Brand] [product]". */
  href?: string
}

/** The mark with the product's name, for the top of the rail, sign-in and product emails. */
export const ProductLockup = React.forwardRef<HTMLElement, ProductLockupProps>(function ProductLockup(
  { product = PRODUCT.name, color = "auto", layout = "inline", height, href, className, ...rest },
  ref
) {
  const Link = useLink()
  const h = Math.max(height ?? BRAND.logo.height, BRAND.logo.minHeight)
  const ink = color === "ink"
  const content = (
    <>
      <Logo color={color} height={h} title={href ? "" : undefined} />
      {layout === "inline" ? (
        // A border, not a fill, so the hairline survives forced colours.
        <span aria-hidden data-slot="product-lockup-rule" className={cn("my-0.5 w-0 self-stretch border-l", ink ? "border-current/40" : "border-line")} />
      ) : null}
      <span
        data-slot="product-lockup-name"
        // Never larger than the mark: the name steps down with a small one.
        className={cn(
          "min-w-0 truncate",
          h >= 24 ? "type-heading" : h >= 20 ? "type-label" : "type-caption",
          ink ? "text-current" : "text-text-strong"
        )}
      >
        {product}
      </span>
    </>
  )
  const classes = cn(
    "inline-flex max-w-full min-w-0",
    layout === "inline" ? "items-center gap-3" : "flex-col items-start gap-2",
    className
  )

  if (href) {
    return (
      <Link
        ref={ref as never}
        href={href}
        aria-label={`${BRAND.name} ${product}`}
        data-slot="product-lockup"
        className={cn(classes, "min-h-6 rounded-xs pointer-coarse:min-h-10", layout === "stacked" && "justify-center")}
        {...rest}
      >
        {content}
      </Link>
    )
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} data-slot="product-lockup" className={classes} {...rest}>
      {content}
    </div>
  )
})

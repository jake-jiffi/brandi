"use client"

import * as React from "react"

import { BRAND, STAND_IN_MARKS } from "@/lib/brand"
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
  /** Makes the whole lockup one link, named "[Brand] [product]", or the brand alone when the product has its name. */
  href?: string
  /** `rail` for the rail and the top bar: the name takes the rail's strong text colour, so it never sinks into a dark rail. */
  tone?: "default" | "rail"
}

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

/**
 * What the lockup is called: the brand and the product, or the brand once when the product carries the brand's own
 * name, which a lockup would otherwise show twice ("[Brand] / [BRAND]") and a screen reader read twice.
 */
export function lockupLabel(product: string) {
  return sameName(product, BRAND.name) ? BRAND.name : `${BRAND.name} ${product}`
}

/**
 * Whether the brand has no drawn logo yet and carries the kit's stand-in, whose full mark spells PRODUCT. A lockup
 * then shows the stand-in's symbol and the brand's name in words, so no screen names a brand that is not this one: a
 * run's sign-in and booking pages said PRODUCT and never the brand's name.
 */
export function standInMark() {
  return BRAND.marks === STAND_IN_MARKS
}

/** The mark with the product's name, for the top of the rail, sign-in and product emails. */
export const ProductLockup = React.forwardRef<HTMLElement, ProductLockupProps>(function ProductLockup(
  { product = PRODUCT.name, color = "auto", layout = "inline", height, href, tone = "default", className, ...rest },
  ref
) {
  const Link = useLink()
  const h = Math.max(height ?? BRAND.logo.height, BRAND.logo.minHeight)
  const ink = color === "ink"
  const standIn = standInMark()
  // A product named for the brand is the mark alone: the mark already says the name. The stand-in says none.
  const alone = !standIn && sameName(product, BRAND.name)
  const content = (
    <>
      <Logo mark={standIn ? "symbol" : "full"} color={color} height={h} title={href || standIn ? "" : undefined} className={tone === "rail" && !ink ? "text-rail-text-strong" : undefined} />
      {!alone && !standIn && layout === "inline" ? (
        // A border, not a fill, so the hairline survives forced colours.
        <span aria-hidden data-slot="product-lockup-rule" className={cn("my-0.5 w-0 self-stretch border-l", ink ? "border-current/40" : "border-line")} />
      ) : null}
      {alone ? null : (
        <span
          data-slot="product-lockup-name"
          // Never larger than the mark: the name steps down with a small one.
          className={cn(
            "min-w-0 truncate",
            PRODUCT.lockupName === "eyebrow" ? "type-eyebrow" : h >= 24 ? "type-heading" : h >= 20 ? "type-label" : "type-caption",
            ink ? "text-current" : tone === "rail" ? "text-rail-text-strong" : "text-text-strong"
          )}
        >
          {standIn ? lockupLabel(product) : product}
        </span>
      )}
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
        aria-label={lockupLabel(product)}
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

import * as React from "react"

import { BRAND, type MarkRendition } from "@/lib/brand"
import { cn } from "@/lib/utils"

export type LogoMark = "full" | "symbol"
export type LogoColor = "auto" | "on-light" | "on-dark" | "ink"

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "title" | "children"> {
  /** The full logo, or the symbol alone for square and narrow places. A brand without a symbol shows its full logo. */
  mark?: LogoMark
  /** `auto` follows the theme. Otherwise one of the brand's approved renditions; `ink` takes the colour of the text around it. */
  color?: LogoColor
  /** Height in px. Defaults to the logo system's preferred size; values under its minimum are raised to it. */
  height?: number
  /** Adds the logo system's clear space around the mark, as padding. */
  clearspace?: boolean
  /** Its accessible name, the brand's name by default. `""` when a parent link already names it. */
  title?: string
}

function rendition(mark: LogoMark, color: LogoColor, ground: "light" | "dark" | "forced"): MarkRendition {
  const m = mark === "symbol" && BRAND.marks.symbol ? "symbol" : "full"
  const has = (key: MarkRendition) => Boolean(BRAND.marks[key])
  const ink: MarkRendition = has(`${m}-ink`) ? `${m}-ink` : m
  const onDark: MarkRendition = has(`${m}-on-dark`) ? `${m}-on-dark` : ink
  if (color === "ink" || ground === "forced") return ink
  if (color === "on-dark" || (color === "auto" && ground === "dark")) return onDark
  return m
}

function Rendition({ name, className }: { name: MarkRendition; className: string }) {
  return (
    <span
      data-slot="logo-rendition"
      data-rendition={name}
      className={cn("h-full [&>svg]:block [&>svg]:h-full [&>svg]:w-auto", className)}
      dangerouslySetInnerHTML={{ __html: BRAND.marks[name] ?? "" }}
    />
  )
}

/** The brand's mark, from the master artwork: never set in type, never redrawn. */
export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  { mark = "full", color = "auto", height, clearspace = false, title = BRAND.name, className, style, ...rest },
  ref
) {
  const min = mark === "symbol" && BRAND.marks.symbol ? BRAND.logo.symbolMinHeight : BRAND.logo.minHeight
  const h = Math.max(height ?? BRAND.logo.height, min)
  const pad = clearspace ? Math.round(h * BRAND.logo.clearSpace) : 0
  const light = rendition(mark, color, "light")
  const dark = rendition(mark, color, "dark")
  const forced = rendition(mark, color, "forced")
  const named = title !== ""
  return (
    <span
      ref={ref}
      data-slot="logo"
      data-mark={mark}
      data-color={color}
      role={named ? "img" : undefined}
      aria-label={named ? title : undefined}
      aria-hidden={named ? undefined : true}
      // `ink` takes its colour from the parent; every other rendition sets the brand's ink for any
      // part drawn in currentColor.
      className={cn("inline-flex shrink-0", color !== "ink" && "text-text-strong", className)}
      // The clear space is added to the height rather than through box-sizing, which a canvas's own
      // base styles override.
      style={{ ...style, height: h + 2 * pad, padding: pad || undefined }}
      {...rest}
    >
      {/* The theme picks between the light and dark renditions in CSS, so the server and the canvas agree. */}
      <span className="contents forced-colors:hidden">
        {light === dark ? (
          <Rendition name={light} className="flex" />
        ) : (
          <>
            <Rendition name={light} className="flex dark:hidden" />
            <Rendition name={dark} className="hidden dark:flex" />
          </>
        )}
      </span>
      {/* An SVG keeps its own colours in forced colours, so the single ink stands in, as CanvasText. */}
      <Rendition name={forced} className="hidden forced-colors:flex forced-colors:text-[color:CanvasText]" />
    </span>
  )
})

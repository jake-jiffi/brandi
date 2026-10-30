import * as React from "react"

import { BRAND, type MarkRendition } from "@/lib/brand"
import { cn } from "@/lib/utils"

export type LogoMark = "full" | "symbol"
export type LogoColor = "auto" | "on-light" | "on-dark" | "ink" | "rail"

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "title" | "children"> {
  /** The full logo, or the symbol alone for square and narrow places. A brand without a symbol shows its full logo. */
  mark?: LogoMark
  /** `auto` follows the theme, `rail` the rail's tone. Otherwise one of the brand's approved renditions; `ink` takes the colour of the text around it. */
  color?: LogoColor
  /** Height in px. Defaults to the logo system's preferred size (the symbol's own, 24px); values under its minimum are raised to it. */
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
  if (color === "on-dark" || ((color === "auto" || color === "rail") && ground === "dark")) return onDark
  return m
}

// A mark's own ids (clip paths, gradients) are made unique to each copy. Logo draws several renditions
// at once and a page can carry several logos, and a repeated id sends url(#id) to the wrong copy.
function scopeIds(svg: string, scope: string) {
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  let out = svg
  for (const id of ids) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out
      .replace(new RegExp(`(\\sid=")${safe}"`, "g"), `$1${scope}-${id}"`)
      .replace(new RegExp(`url\\(#${safe}\\)`, "g"), `url(#${scope}-${id})`)
      .replace(new RegExp(`(href=")#${safe}"`, "g"), `$1#${scope}-${id}"`)
  }
  return out
}

function Rendition({ name, className }: { name: MarkRendition; className: string }) {
  const scope = React.useId().replace(/[^A-Za-z0-9]/g, "")
  return (
    <span
      data-slot="logo-rendition"
      data-rendition={name}
      className={cn("h-full [&>svg]:block [&>svg]:h-full [&>svg]:w-auto", className)}
      dangerouslySetInnerHTML={{ __html: scopeIds(BRAND.marks[name] ?? "", `m${scope}`) }}
    />
  )
}

/** A logo's width at a height, from its master artwork's proportions (the viewBox), or null when it has none. */
export function logoWidth(height: number, mark: MarkRendition = "full"): number | null {
  const box = /viewBox="[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/.exec(BRAND.marks[mark] ?? "")
  return box ? (height * Number(box[1])) / Number(box[2]) : null
}

// The symbol's own size, for a square place: the icons rail's home control, a 40px square, holds it at 24px. It
// never takes BRAND.logo.height, which the starter raises to the full logo's minimum: a wide logo's 45px drew a
// signature used as the symbol 107px wide in that square.
const SYMBOL_HEIGHT = 24

/** The brand's mark, from the master artwork: never set in type, never redrawn. */
export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  { mark = "full", color = "auto", height, clearspace = false, title = BRAND.name, className, style, ...rest },
  ref
) {
  const symbol = mark === "symbol" && Boolean(BRAND.marks.symbol)
  const min = symbol ? BRAND.logo.symbolMinHeight : BRAND.logo.minHeight
  const h = Math.max(height ?? (symbol ? SYMBOL_HEIGHT : BRAND.logo.height), min)
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
      // part drawn in currentColor, the rail's own words on the rail.
      className={cn("inline-flex shrink-0", color === "rail" ? "text-rail-text-strong" : color !== "ink" && "text-text-strong", className)}
      // The clear space is added to the height rather than through box-sizing, which a canvas's own
      // base styles override.
      style={{ ...style, height: h + 2 * pad, padding: pad || undefined }}
      {...rest}
    >
      {/* The theme picks between the light and dark renditions in CSS, so the server and the canvas agree. On the rail,
          the rail's tone does, through variables the tokens set and a direction's class can flip: chosen when the
          bundle was built, a green-rail direction drew the mark made for dark grounds on green. */}
      <span className="contents forced-colors:hidden">
        {light === dark ? (
          <Rendition name={light} className="flex" />
        ) : color === "rail" ? (
          <>
            <Rendition name={light} className="[display:var(--rail-mark-on-light,flex)]" />
            <Rendition name={dark} className="[display:var(--rail-mark-on-dark,none)]" />
          </>
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

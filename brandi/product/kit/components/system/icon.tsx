import * as React from "react"

import { ICONS, type IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type IconSize = 12 | 14 | 16 | 18 | 20 | 24

export interface IconProps {
  /** A name from the system's icon vocabulary (lib/icons.ts). */
  name: IconName
  /** 12 in badges, 14 in chips and meta lines, 16 in buttons, inputs, menus and tables, 18 on the rail, 20 to 24 in empty states. */
  size?: IconSize
  strokeWidth?: number
  /** Its accessible name. Without one the icon is decoration and screen readers skip it. */
  label?: string
  className?: string
}

/** One icon set, by name, drawn in currentColor at the set's stroke. */
export function Icon({ name, size = 16, strokeWidth = 2, label, className }: IconProps) {
  const Glyph = ICONS[name]
  if (!Glyph) return null
  return (
    <Glyph
      data-slot="icon"
      data-icon={name}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("shrink-0", className)}
    />
  )
}

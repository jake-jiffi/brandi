"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { IconName } from "@/lib/icons"

import { Icon } from "./icon"

export type IconButtonVariant = "ghost" | "secondary" | "primary" | "danger"
export type IconButtonSize = "sm" | "md" | "lg"

const VARIANT = { ghost: "ghost", secondary: "secondary", primary: "default", danger: "destructive" } as const
const SIZE = { sm: "icon-sm", md: "icon", lg: "icon-lg" } as const

export interface IconButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children" | "aria-label"> {
  icon: IconName
  /** Required: its accessible name and its tooltip. Name what it acts on: "More actions for [record]". */
  label: string
  /** `ghost` in toolbars and dense rows. `secondary` stands alone, `primary` sends, `danger` removes. */
  variant?: IconButtonVariant
  /** 32, 36 or 44px square; 40, 44 or 48px on a touch screen. */
  size?: IconButtonSize
  /** Shows the tooltip in place, for a design. Leave it unset in product code. */
  tooltipOpen?: boolean
}

/** An icon-only button. Only for actions people know by their icon: more, close, refresh, copy, previous, next. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "ghost", size = "md", tooltipOpen, type, ...rest },
  ref
) {
  return (
    // Only true forces the tooltip open; false or unset leaves it to hover and focus, so it can never be silenced.
    <Tooltip open={tooltipOpen ? true : undefined}>
      <TooltipTrigger asChild>
        <ButtonBase ref={ref} type={type ?? "button"} variant={VARIANT[variant]} size={SIZE[size]} aria-label={label} {...rest}>
          <Icon name={icon} className={size === "lg" ? "size-5" : undefined} />
        </ButtonBase>
      </TooltipTrigger>
      <TooltipContent sideOffset={4} collisionPadding={8} className="z-(--z-tooltip) rounded-sm bg-surface-inverse px-2 py-1 type-caption text-text-inverse">
        {/* Radix points the trigger's description at the tooltip. Its words are the name again, so they are
            hidden from screen readers and the label is heard once. */}
        <span aria-hidden="true">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
})

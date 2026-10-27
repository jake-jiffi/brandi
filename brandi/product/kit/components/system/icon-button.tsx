"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import type { IconName } from "@/lib/icons"

import { Icon } from "./icon"
import { Tooltip } from "./tooltip"

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
    // The system's Tooltip: hover, keyboard focus and a long press, and in a design a still picture with
    // nothing listening. Only true shows it in place; unset leaves it to people, so it can never be silenced.
    // Its words are the button's name, so it adds no description and the label is heard once.
    <Tooltip content={label} open={tooltipOpen ? true : undefined}>
      <ButtonBase ref={ref} type={type ?? "button"} variant={VARIANT[variant]} size={SIZE[size]} aria-label={label} {...rest}>
        <Icon name={icon} className={size === "lg" ? "size-5" : undefined} />
      </ButtonBase>
    </Tooltip>
  )
})

"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { Tooltip } from "./tooltip"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "brand" | "danger" | "danger-solid" | "link"
export type ButtonSize = "sm" | "md" | "lg"

const VARIANT = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  brand: "brand",
  danger: "destructive",
  "danger-solid": "destructive-solid",
  link: "link",
} as const
const SIZE = { sm: "sm", md: "default", lg: "lg" } as const

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** `primary` once per view. `secondary` is every other action. `danger-solid` only for a destructive dialog's final confirm. */
  variant?: ButtonVariant
  /** 32, 36 or 44px; 40, 44 or 48px on a touch screen. */
  size?: ButtonSize
  icon?: IconName
  iconRight?: IconName
  /** Keeps the width, shows a spinner, sets aria-busy and ignores presses. It stays focusable. */
  loading?: boolean
  /**
   * Why it cannot be pressed yet: "Confirm 2 checks first". It stays focusable, is aria-disabled, says why in a
   * tooltip and in its description, and ignores presses. Prefer it to `disabled`, which drops focus and says nothing.
   */
  disabledReason?: string
  block?: boolean
  /** Renders a link that looks like a button. Links navigate; buttons act. */
  href?: string
  children?: React.ReactNode
}

/** The pressable action. One to three words, verb first, in sentence case. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, iconRight, loading = false, disabledReason, block = false, href, className, style, children, onClick, type, disabled, ...rest },
  ref
) {
  const own = React.useRef<HTMLButtonElement | null>(null)
  const merged = useMergedRef(ref, own)
  const Link = useLink()
  // Loading keeps the width the label had, so the row does not jump when the label changes.
  const [minWidth, setMinWidth] = React.useState<number | undefined>()
  React.useLayoutEffect(() => {
    if (loading && own.current) setMinWidth(own.current.offsetWidth)
    if (!loading) setMinWidth(undefined)
  }, [loading])

  const content = (
    <>
      {loading ? <Icon name="LoaderCircle" className="animate-spin" /> : icon ? <Icon name={icon} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} /> : null}
    </>
  )
  const classes = cn(block && "w-full", className)

  const reason = disabledReason?.trim() || undefined
  // A reason swallows the press, as loading does. A caller's own aria-disabled still hears it: AskBar's empty Ask
  // moves focus to the field, which is how it explains itself.
  const blocked = loading || Boolean(reason)

  if (href && !disabled && !loading && !reason) {
    // Through the product's link, so a link that looks like a button still navigates on the client.
    return (
      <ButtonBase asChild variant={VARIANT[variant]} size={SIZE[size]} className={classes} style={style}>
        <Link href={href} data-slot="button">{content}</Link>
      </ButtonBase>
    )
  }

  const button = (
    <ButtonBase
      ref={merged}
      type={type ?? "button"}
      variant={VARIANT[variant]}
      size={SIZE[size]}
      className={classes}
      style={minWidth ? { ...style, minWidth } : style}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
      aria-disabled={loading || reason ? true : rest["aria-disabled"]}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
    >
      {content}
    </ButtonBase>
  )
  // The tooltip says why on hover, keyboard focus and a long press, and describes the button, so a screen reader
  // hears the reason after the name.
  return reason ? (
    <Tooltip content={reason} className={block ? "flex w-full" : undefined}>
      {button}
    </Tooltip>
  ) : (
    button
  )
})

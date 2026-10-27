import * as React from "react"

import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type SpinnerSize = 12 | 14 | 16 | 20 | 24

export interface SpinnerProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** 14 or 16 in a cell or a button; 20 or 24 beside a heading. */
  size?: SpinnerSize
  /** What a screen reader hears. `null` when the words beside it already say what is happening. */
  label?: string | null
}

/**
 * A small inline spinner for a busy button or cell. Under reduced motion it slows right down instead of
 * stopping, so it never looks like a hang.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 16, label = "Loading", className, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      data-slot="spinner"
      role={label ? "status" : undefined}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      {...rest}
    >
      <Icon name="LoaderCircle" size={size} className="animate-spin" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
})

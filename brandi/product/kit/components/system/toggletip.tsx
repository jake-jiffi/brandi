"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { Popover as PopoverRoot, PopoverContent, PopoverTrigger, popoverContentVariants } from "@/components/ui/popover"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { bubblePicture } from "./tooltip"

export type ToggletipPlacement = "top" | "bottom" | "right" | "left"

export interface ToggletipProps {
  /** The info button's name, saying what it explains: "About [net revenue]". */
  label: string
  /** The definition: a sentence or two, never anything to press. A Popover holds controls. */
  content: React.ReactNode
  /** Where it opens. It flips to stay on screen. */
  placement?: ToggletipPlacement
  /** Shows it open, in place, for a design on a board. */
  open?: boolean
  /** The button's icon. */
  icon?: IconName
  className?: string
}

const HOVER_DELAY_MS = 150
const LEAVE_DELAY_MS = 120

/**
 * A definition behind an info button: hover shows it after a short delay, and a press, a tap or Enter
 * opens it and reads it out. Escape or a press elsewhere closes it. Focus stays on the button.
 */
export const Toggletip = React.forwardRef<HTMLButtonElement, ToggletipProps>(function Toggletip(
  { label, content, placement = "top", open, icon = "Info", className },
  ref
) {
  const design = open !== undefined
  // "hover" while the pointer rests on it; "press" once someone pressed it, which only a press, Escape or
  // a press elsewhere undoes.
  const [mode, setMode] = React.useState<"closed" | "hover" | "press">("closed")
  const [spoken, setSpoken] = React.useState<React.ReactNode>(null)
  const timer = React.useRef<number | undefined>(undefined)
  const isOpen = design ? Boolean(open) : mode !== "closed"

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const closeNow = () => {
    window.clearTimeout(timer.current)
    setMode("closed")
    setSpoken(null)
  }
  const hoverIn = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return
    window.clearTimeout(timer.current)
    if (mode === "closed") timer.current = window.setTimeout(() => setMode("hover"), HOVER_DELAY_MS)
  }
  const hoverOut = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return
    window.clearTimeout(timer.current)
    if (mode !== "press") timer.current = window.setTimeout(() => setMode((m) => (m === "hover" ? "closed" : m)), LEAVE_DELAY_MS)
  }

  const button = (
    <ButtonBase
      ref={ref}
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      // Only the picture sets this itself: in use Radix sets it, and a child's own value would win.
      {...(design ? { "aria-expanded": isOpen } : {})}
      className="size-6 text-text-muted hover:text-text-strong pointer-coarse:-m-2 pointer-coarse:size-10"
    >
      <Icon name={icon} size={14} />
    </ButtonBase>
  )

  // Design mode draws a still picture: the button, and the open definition beside it, with nothing
  // listening, so a board never loses a key or a press to it.
  if (design) {
    const at = bubblePicture[placement] ?? bubblePicture.top
    return (
      <span data-slot="toggletip" className={cn("relative inline-flex align-middle", className)}>
        {button}
        {isOpen ? (
          <span aria-hidden="true" data-slot="popover-content" data-look="tip" data-side={placement} className={cn(popoverContentVariants({ look: "tip" }), at.bubble)}>
            {content}
            <span className={cn("size-2.5 rotate-45 rounded-[2px] bg-surface-inverse", at.arrow)} />
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <span data-slot="toggletip" className={cn("relative inline-flex align-middle", className)}>
      <PopoverRoot open={isOpen} onOpenChange={(next) => { if (!next) closeNow() }}>
        <PopoverTrigger
          asChild
          // A toggletip is a disclosure, not a dialog, and its words reach screen readers through the
          // status beside it.
          aria-haspopup={undefined}
          aria-controls={undefined}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault()
            window.clearTimeout(timer.current)
            if (mode === "press") {
              closeNow()
              return
            }
            setMode("press")
            setSpoken(content)
          }}
          onPointerEnter={hoverIn}
          onPointerLeave={hoverOut}
        >
          {button}
        </PopoverTrigger>
        <PopoverContent
          look="tip"
          side={placement}
          align="center"
          aria-hidden="true"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={hoverIn}
          onPointerLeave={hoverOut}
        >
          {content}
        </PopoverContent>
      </PopoverRoot>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </span>
  )
})

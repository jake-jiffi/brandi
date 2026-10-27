"use client"

import * as React from "react"

import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger, tooltipArrow, tooltipBubble } from "@/components/ui/tooltip"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

export type TooltipPlacement = "top" | "bottom" | "right"

/**
 * Where a still picture of an open bubble sits against its trigger, for a design on a board (Tooltip,
 * Toggletip). A picture mounts no layer, so it never takes a key, a press or a focus from the page.
 */
export const bubblePicture = {
  top: { bubble: "absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2", arrow: "absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2" },
  bottom: { bubble: "absolute top-full left-1/2 mt-1.5 -translate-x-1/2", arrow: "absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1/2" },
  right: { bubble: "absolute top-1/2 left-full ml-1.5 -translate-y-1/2", arrow: "absolute top-1/2 right-full translate-x-1/2 -translate-y-1/2" },
  left: { bubble: "absolute top-1/2 right-full mr-1.5 -translate-y-1/2", arrow: "absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2" },
} as const

export interface TooltipProps {
  /** One short sentence at most. Never the only home for something people need, and never interactive. */
  content: React.ReactNode
  /** Where it opens. It shifts to stay on screen. */
  placement?: TooltipPlacement
  /** Shows it open, in place, for a design on a board. */
  open?: boolean
  /** The control it describes. When nothing inside can take focus, the wrapper takes it instead. */
  children: React.ReactNode
  className?: string
}

// A disabled control cannot take focus, so around one the wrapper takes it and says why.
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
// Just under the platforms' own long press, so the tooltip wins the race with text selection.
const LONG_PRESS_MS = 450
const PRESS_SLOP = 10

/** The words a control is already known by: its label, or its own text. */
function nameOf(el: HTMLElement, skip: Element | null) {
  const label = el.getAttribute("aria-label")
  if (label) return label
  const by = el.getAttribute("aria-labelledby")
  if (by) return by.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ")
  return Array.from(el.childNodes).filter((n) => n !== skip).map(heard).join("")
}

/** The text a screen reader hears: an aria-hidden part, such as a figure drawn beside its spoken words, is left out. */
function heard(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (node instanceof Element && node.getAttribute("aria-hidden") === "true") return ""
  return Array.from(node.childNodes).map(heard).join("")
}

/**
 * A short label on hover or keyboard focus, and on a long press on a touch screen. It describes the
 * control it wraps, which on a canvas sits inside a wrapper of its own, so it finds that control inside.
 */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { content, placement = "top", open, children, className },
  ref
) {
  const own = React.useRef<HTMLSpanElement | null>(null)
  const merged = useMergedRef(ref, own)
  const descId = React.useId()
  const [shown, setShown] = React.useState(false)
  const press = React.useRef<{ timer: number; x: number; y: number } | null>(null)
  const swallowClick = React.useRef(false)
  const empty = content === null || content === undefined || content === false || content === ""
  const isOpen = empty ? false : (open ?? shown)

  // Describe the control by the tooltip's words, unless its name already says them (IconButton's label
  // is its tooltip). With nothing focusable inside, the wrapper takes focus, so keyboard people get it too.
  // Radix writes its own copy of the words onto the wrapper while open; this runs after every commit and
  // replaces it, so nothing is read twice.
  React.useLayoutEffect(() => {
    const wrap = own.current
    if (!wrap) return
    const desc = document.getElementById(descId)
    const inner = wrap.querySelector<HTMLElement>(FOCUSABLE)
    const control = inner ?? wrap
    if (!inner && !empty) wrap.tabIndex = 0
    else wrap.removeAttribute("tabindex")
    const words = (desc?.textContent ?? "").trim().toLowerCase()
    const name = nameOf(control, desc).trim().toLowerCase()
    if (control !== wrap) wrap.removeAttribute("aria-describedby")
    const others = control === wrap ? [] : (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((id) => id && id !== descId)
    const ids = !empty && words && !name.includes(words) ? [...others, descId] : others
    if (ids.length) control.setAttribute("aria-describedby", ids.join(" "))
    else control.removeAttribute("aria-describedby")
    return () => {
      const left = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((id) => id && id !== descId)
      if (left.length) control.setAttribute("aria-describedby", left.join(" "))
      else control.removeAttribute("aria-describedby")
    }
  })

  React.useEffect(() => () => {
    if (press.current) window.clearTimeout(press.current.timer)
  }, [])

  const endPress = () => {
    if (press.current) window.clearTimeout(press.current.timer)
    press.current = null
  }

  // Design mode draws a still picture: the control, and the open bubble beside it, with nothing listening.
  if (open !== undefined) {
    const at = bubblePicture[placement] ?? bubblePicture.top
    return (
      <span ref={merged} data-slot="tooltip-trigger" data-state={isOpen ? "open" : "closed"} className={cn("relative inline-flex max-w-full align-middle", className)}>
        {children}
        <span id={descId} hidden>
          {content}
        </span>
        {isOpen ? (
          <span aria-hidden="true" data-slot="tooltip-content" data-side={placement} className={cn(tooltipBubble, at.bubble)}>
            {content}
            <span className={cn(tooltipArrow, at.arrow)} />
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <TooltipRoot open={isOpen} onOpenChange={setShown}>
      <TooltipTrigger
        asChild
        onPointerDown={(event) => {
          if (event.pointerType !== "touch" || empty) return
          endPress()
          press.current = {
            x: event.clientX,
            y: event.clientY,
            timer: window.setTimeout(() => {
              press.current = null
              swallowClick.current = true
              window.setTimeout(() => { swallowClick.current = false }, 800)
              setShown(true)
            }, LONG_PRESS_MS),
          }
        }}
        onPointerMove={(event) => {
          const p = press.current
          if (p && Math.hypot(event.clientX - p.x, event.clientY - p.y) > PRESS_SLOP) endPress()
        }}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onContextMenu={(event) => {
          // A long press on a touch screen shows the tooltip, not the browser's menu.
          if (press.current || swallowClick.current) event.preventDefault()
        }}
        onClickCapture={(event) => {
          // The press that showed the tooltip does not also press the control.
          if (!swallowClick.current) return
          swallowClick.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <span ref={merged} className={cn("inline-flex max-w-full align-middle [-webkit-touch-callout:none] pointer-coarse:select-none", className)}>
          {children}
          <span id={descId} hidden>
            {content}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side={placement}>{content}</TooltipContent>
    </TooltipRoot>
  )
})

/**
 * Whether an element's text is cut short, kept current as it resizes and as fonts arrive, so a cut
 * label can offer its full text on hover, focus and a long press (Badge, Tag).
 */
export function useTruncated(el: HTMLElement | null) {
  const [cut, setCut] = React.useState(false)
  // New words at the same width resize nothing, so measure after every render as well. Only a label still
  // on the page counts: wrapping a cut label in its Tooltip replaces it, and the old one measures zero.
  React.useLayoutEffect(() => {
    if (el?.isConnected) setCut(el.scrollWidth > el.clientWidth + 1)
  })
  React.useLayoutEffect(() => {
    if (!el) return
    const measure = () => {
      if (el.isConnected) setCut(el.scrollWidth > el.clientWidth + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    let live = true
    document.fonts?.ready.then(() => { if (live) measure() })
    return () => {
      live = false
      observer.disconnect()
    }
  }, [el])
  return cut
}

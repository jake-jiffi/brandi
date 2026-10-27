"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { hasActions, renderActions, sentence, type FeedbackAction } from "./alert"

export interface LoadingStateProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  /** What is happening, naming the system: "Pulling this week's [jobs] from [booking system]". "Loading" is a fallback, not copy. */
  title?: React.ReactNode
  /** A second line. */
  children?: React.ReactNode
  /** The brand's character at work: its file, or an element. Decorative. */
  picture?: string | React.ReactNode
  /** How long it usually takes, shown and said once the wait passes ten seconds: "This usually takes about [2] minutes." */
  usually?: React.ReactNode
  /** A way to leave once the wait passes ten seconds: Buttons, or the same as data. */
  actions?: React.ReactNode | FeedbackAction[]
  /** Shows the over-ten-seconds form at once, for a design or a wait known to be long. */
  slow?: boolean
}

/** An area waiting on another system for more than a second: what is happening, an indeterminate bar, and the character working when there is one. */
export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(function LoadingState(
  { title = "Loading", children, picture, usually, actions, slow = false, className, ...rest },
  ref
) {
  // Under a second it shows nothing (appear-late) and says nothing. At a second the status line fills, which is
  // a change, so a screen reader reads it; at ten seconds it adds how long the wait usually is.
  const [waited, setWaited] = React.useState<"moment" | "second" | "long">("moment")
  React.useEffect(() => {
    const second = window.setTimeout(() => setWaited((w) => (w === "moment" ? "second" : w)), 1000)
    const long = window.setTimeout(() => setWaited("long"), 10000)
    return () => {
      window.clearTimeout(second)
      window.clearTimeout(long)
    }
  }, [])
  const isLong = slow || waited === "long"

  const bar = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = bar.current
    if (!el || typeof el.animate !== "function") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let run: Animation | undefined
    const start = () => {
      run?.cancel()
      // Reduced motion slows the bar right down rather than stopping it: a bar standing still looks like a hang.
      run = el.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(250%)" }], {
        duration: reduce.matches ? 2400 : 1400,
        iterations: Infinity,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      })
    }
    start()
    reduce.addEventListener?.("change", start)
    return () => {
      reduce.removeEventListener?.("change", start)
      run?.cancel()
    }
  }, [])

  const media =
    typeof picture === "string" && picture ? (
      <img src={picture} alt="" data-slot="loading-state-picture" className="h-28 w-auto max-w-full object-contain" />
    ) : picture ? (
      <div aria-hidden="true" data-slot="loading-state-picture" className="flex h-28 items-end justify-center">
        {picture}
      </div>
    ) : null

  return (
    <div
      ref={ref}
      data-slot="loading-state"
      className={cn("appear-late flex w-full flex-col items-center justify-center gap-4 px-6 py-10 text-center", className)}
      {...rest}
    >
      {media}
      <div data-slot="progress" aria-hidden="true" className="relative h-1 w-48 max-w-full overflow-hidden rounded-full bg-chart-track">
        <div ref={bar} data-slot="progress-indicator" className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-primary" />
      </div>
      {/* The words are said once, by the status below, so the visible copy is hidden from screen readers. */}
      <div aria-hidden="true" className="flex max-w-measure flex-col items-center gap-1 text-balance wrap-break-word">
        <p className="m-0 type-label text-text-strong">{title}</p>
        {children ? <p className="m-0 type-meta text-text-muted">{children}</p> : null}
        {isLong && usually ? <p className="m-0 type-meta text-text-muted">{usually}</p> : null}
      </div>
      {isLong && hasActions(actions) ? <div className="flex flex-wrap justify-center gap-2">{renderActions(actions)}</div> : null}
      {/* Read aloud as one status, so lines that were apart on screen get a full stop between them. */}
      <p role="status" data-slot="loading-state-status" className="sr-only">
        {waited === "moment" ? null : (
          <>
            {children || (isLong && usually) ? sentence(title) : title}
            {children ? <> {isLong && usually ? sentence(children) : children}</> : null}
            {isLong && usually ? <> {usually}</> : null}
          </>
        )}
      </p>
    </div>
  )
})

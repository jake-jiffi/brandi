"use client"

import * as React from "react"

import { BRAND, type CharacterState } from "@/lib/brand"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

export interface CharacterProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The moment it marks. A moment the brand's pack has no pose for renders nothing, and the words carry it. */
  pose: CharacterState
  /** Height in px; the width follows the drawing, never squashed. */
  size?: number
  /** The 2D rendition, when the pack also has 3D stills. */
  flat?: boolean
  /** A gentle loop, for working and calm moments only. It never runs under reduced motion. */
  motion?: boolean
}

/** The brand's character, marking a state: welcome, working, done, all caught up, nothing found, help. */
export const Character = React.forwardRef<HTMLSpanElement, CharacterProps>(function Character(
  { pose, size = 96, flat = false, motion = false, className, style, ...rest },
  ref
) {
  const character = BRAND.character
  const art = (flat ? character?.flat?.[pose] : undefined) ?? character?.poses[pose]
  const own = React.useRef<HTMLSpanElement | null>(null)
  const merged = useMergedRef(ref, own)

  // The loop runs through the Web Animations API, so it starts and stops with the person's setting,
  // even when it changes while the character is on screen.
  React.useEffect(() => {
    const el = own.current
    if (!motion || !el || typeof el.animate !== "function") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let loop: Animation | undefined
    const sync = () => {
      loop?.cancel()
      loop = reduce.matches
        ? undefined
        : el.animate([{ transform: "translateY(0)" }, { transform: "translateY(-4%)" }], {
            duration: 1600,
            direction: "alternate",
            iterations: Infinity,
            easing: "ease-in-out",
          })
    }
    sync()
    reduce.addEventListener("change", sync)
    return () => {
      reduce.removeEventListener("change", sync)
      loop?.cancel()
    }
  }, [motion, art])

  if (!art) return null
  // Markup is drawn inline (an XML declaration included); anything else is the address of a still.
  const inline = art.trimStart().startsWith("<")
  return (
    <span
      ref={merged}
      aria-hidden
      data-slot="character"
      data-pose={pose}
      className={cn("inline-flex shrink-0 [&>img]:h-full [&>img]:w-auto [&>svg]:block [&>svg]:h-full [&>svg]:w-auto", className)}
      style={{ ...style, height: size }}
      {...(inline ? { dangerouslySetInnerHTML: { __html: art } } : {})}
      {...rest}
    >
      {inline ? undefined : <img src={art} alt="" height={size} />}
    </span>
  )
})

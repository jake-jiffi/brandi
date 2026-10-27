"use client"

import * as React from "react"

import { Kbd as KbdBase } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

export type KbdVariant = "default" | "rail"
export type KbdPlatform = "auto" | "mac" | "other"

// Mac modifiers in Apple's order. Elsewhere the same keys read Ctrl, Alt, Shift, in that order.
const MODIFIERS = ["⌃", "⌥", "⇧", "⌘"] as const
type Modifier = (typeof MODIFIERS)[number]
const MAC_SPOKEN: Record<Modifier, string> = { "⌃": "Control", "⌥": "Option", "⇧": "Shift", "⌘": "Command" }
const OTHER_NAME: Record<Modifier, string> = { "⌃": "Ctrl", "⌥": "Alt", "⇧": "Shift", "⌘": "Ctrl" }
const OTHER_ORDER = ["Ctrl", "Alt", "Shift"]
const OTHER_SPOKEN: Record<string, string> = { Ctrl: "Control", Alt: "Alt", Shift: "Shift" }
const KEY_SPOKEN: Record<string, string> = { "↵": "Return", "⏎": "Return", "⌫": "Delete", "⎋": "Escape", "⇥": "Tab", "↑": "Up arrow", "↓": "Down arrow", "←": "Left arrow", "→": "Right arrow" }
const KEY_OTHER: Record<string, string> = { "↵": "Enter", "⏎": "Enter", "⌫": "Backspace", "⎋": "Esc", "⇥": "Tab" }

/** Splits "⇧⌘P" into its modifiers and the key that follows them. */
function parse(keys: string) {
  const mods: Modifier[] = []
  let rest = keys.trim()
  while (rest && (MODIFIERS as readonly string[]).includes(rest[0])) {
    mods.push(rest[0] as Modifier)
    rest = rest.slice(1).trimStart()
  }
  return { mods, key: rest }
}

/** The keys as shown and as spoken, for an Apple device or for everything else. */
function shortcutText(keys: string, apple: boolean) {
  const { mods, key } = parse(keys)
  if (apple) {
    return { shown: keys.trim(), spoken: [...mods.map((m) => MAC_SPOKEN[m]), KEY_SPOKEN[key] ?? key].filter(Boolean).join(" ") }
  }
  const names = [...new Set(mods.map((m) => OTHER_NAME[m]))].sort((a, b) => OTHER_ORDER.indexOf(a) - OTHER_ORDER.indexOf(b))
  return {
    shown: [...names, KEY_OTHER[key] ?? key].filter(Boolean).join(" "),
    spoken: [...names.map((n) => OTHER_SPOKEN[n]), KEY_OTHER[key] ?? KEY_SPOKEN[key] ?? key].filter(Boolean).join(" "),
  }
}

function isApplePlatform() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || "")
}

/** One character with no modifier: a single-key shortcut, which people can turn off (WCAG 2.1.4). */
function singleKey(keys: string) {
  const { mods, key } = parse(keys)
  return mods.length === 0 && [...key].length === 1 && !KEY_SPOKEN[key]
}

export interface KbdProps extends Omit<React.ComponentPropsWithoutRef<"kbd">, "children"> {
  /** The shortcut in its Mac form, such as "⌘K" or "⇧⌘P". Anything that is not a string is shown as it is. */
  children: React.ReactNode
  /** `rail` takes the rail's own colours, for a hint on the rail. */
  variant?: KbdVariant
  /** `auto` reads the device after the first render: the Mac form on Apple devices, Ctrl and Alt elsewhere. `mac` and `other` fix it, for a board that shows one form. */
  platform?: KbdPlatform
}

/** A key, for shortcuts in menus, the command menu and hints. Hidden on touch screens. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, variant = "default", platform = "auto", className, ...rest },
  ref
) {
  // The server cannot know the device, so the first render is the Mac form and the browser corrects it.
  const [detected, setDetected] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    if (platform === "auto") setDetected(isApplePlatform())
  }, [platform])
  const apple = platform === "mac" ? true : platform === "other" ? false : (detected ?? true)

  if (typeof children !== "string") {
    return (
      <KbdBase ref={ref} variant={variant} className={className} {...rest}>
        {children}
      </KbdBase>
    )
  }
  const { shown, spoken } = shortcutText(children, apple)
  return (
    <KbdBase
      ref={ref}
      variant={variant}
      // A single-key hint hides while Root's shortcuts setting is off, because the key no longer does anything.
      className={cn(singleKey(children) && "[html[data-shortcuts=off]_&]:hidden", className)}
      data-platform={apple ? "mac" : "other"}
      {...rest}
    >
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{spoken}</span>
    </KbdBase>
  )
})

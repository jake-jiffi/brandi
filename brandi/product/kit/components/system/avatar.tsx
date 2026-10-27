"use client"

import * as React from "react"

import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { Icon, type IconSize } from "./icon"

export type AvatarSize = 24 | 28 | 32 | 40
export type AvatarStatus = "online" | "away" | "offline"

const SIZE = { 24: "sm", 28: "md", 32: "default", 40: "lg" } as const
const ICON_SIZE: Record<AvatarSize, IconSize> = { 24: 12, 28: 14, 32: 16, 40: 20 }
const DOT_SIZE: Record<AvatarSize, string> = { 24: "size-2", 28: "size-2.5", 32: "size-2.5", 40: "size-3" }
const TINTS = ["bg-tag-1", "bg-tag-2", "bg-tag-3", "bg-tag-4", "bg-tag-5", "bg-tag-6"]
// Three shapes as well as three colours: full, half and empty, so the status never rides on colour alone.
const STATUS_DOT: Record<AvatarStatus, string> = {
  online: "bg-success-solid",
  away: "border-2 border-warning-solid bg-linear-to-r from-warning-solid from-50% to-surface to-50%",
  offline: "border-2 border-text-subtle bg-surface",
}

/** The first letters of the first and last words, without the brackets sample names wear. */
function initialsOf(name: string) {
  const words = name.replace(/[[\]()]/g, " ").trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ""
  const first = Array.from(words[0])[0] ?? ""
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : ""
  return `${first}${last}`.toUpperCase()
}

/** The same name always gets the same tag tint. */
function tintOf(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0
  return TINTS[hash % TINTS.length]
}

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** The person's name: their initials, and what a screen reader hears. */
  name: string
  /** A photo. Initials show until it loads, and instead of it when it fails. */
  src?: string
  /** 24, 28, 32 or 40px. */
  size?: AvatarSize
  /** The assistant's own avatar. */
  assistant?: boolean
  /** Read with the name: "[Name], online". */
  status?: AvatarStatus
}

/** A person, as a photo or initials on a tinted circle. Always with their name nearby. */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 32, assistant = false, status, className, ...rest },
  ref
) {
  const px: AvatarSize = Number(size) in SIZE ? (Number(size) as AvatarSize) : 32
  return (
    <AvatarBase
      ref={ref}
      size={SIZE[px]}
      role="img"
      aria-label={status ? `${name}, ${status}` : name}
      data-status={status}
      data-assistant={assistant || undefined}
      className={className}
      {...rest}
    >
      {assistant ? (
        <span data-slot="avatar-assistant" className="flex size-full items-center justify-center rounded-full border border-ai-line bg-ai-surface text-ai">
          <Icon name="Sparkles" size={ICON_SIZE[px]} />
        </span>
      ) : (
        <>
          {src ? <AvatarImage src={src} alt="" /> : null}
          {/* The initials are drawn, not written: decoration inside a named image, so they never count as
              visible text a control's name must contain (an account button named "[Name], account menu"
              failed WCAG 2.5.3 on the initials beside the name). */}
          <AvatarFallback className={tintOf(name)}>
            <span aria-hidden="true" data-initials={initialsOf(name)} className="before:content-[attr(data-initials)]" />
          </AvatarFallback>
        </>
      )}
      {status && !assistant ? (
        <span
          aria-hidden="true"
          data-slot="avatar-status"
          className={cn("absolute right-0 bottom-0 z-10 rounded-full ring-2 ring-surface forced-color-adjust-none", DOT_SIZE[px], STATUS_DOT[status])}
        />
      ) : null}
    </AvatarBase>
  )
})

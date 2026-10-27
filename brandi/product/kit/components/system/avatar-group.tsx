"use client"

import * as React from "react"

import { AvatarGroup as AvatarGroupBase, AvatarGroupCount } from "@/components/ui/avatar"
import { formatNumber } from "@/lib/format"
import { LOCALE } from "@/lib/format-locale"
import { cn } from "@/lib/utils"

import { Avatar, type AvatarSize, type AvatarStatus } from "./avatar"
import { Tooltip } from "./tooltip"

// Overlap that keeps every avatar's initials clear of the next avatar's ring.
const OVERLAP: Record<AvatarSize, string> = { 24: "-space-x-0.5", 28: "-space-x-1", 32: "-space-x-1", 40: "-space-x-1" }

export interface AvatarPerson {
  name: string
  src?: string
  status?: AvatarStatus
}

export interface AvatarGroupProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The people on the record, in order. */
  people: AvatarPerson[]
  /** How many avatars show before "+N". */
  max?: number
  /** 24, 28, 32 or 40px. */
  size?: AvatarSize
}

/** Overlapping avatars for the people on a record. "+N" past `max` names the hidden people on hover, on focus and to screen readers. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { people, max = 4, size = 32, className, ...rest },
  ref
) {
  const everyone = people ?? []
  const px: AvatarSize = Number(size) in OVERLAP ? (Number(size) as AvatarSize) : 32
  const limit = Math.max(1, Math.floor(Number(max)) || 4)
  const shown = everyone.slice(0, limit)
  const hidden = everyone.slice(shown.length)
  const hiddenNames = new Intl.ListFormat(LOCALE, { type: "conjunction" }).format(hidden.map((p) => p.name))
  const more = formatNumber(hidden.length)

  return (
    <AvatarGroupBase
      ref={ref}
      role="group"
      aria-label={`${formatNumber(everyone.length)} ${everyone.length === 1 ? "person" : "people"}`}
      className={cn(OVERLAP[px], className)}
      {...rest}
    >
      {shown.map((person, i) => (
        <Avatar key={`${person.name}-${i}`} name={person.name} src={person.src} status={person.status} size={px} />
      ))}
      {hidden.length ? (
        <Tooltip content={hiddenNames}>
          <AvatarGroupCount role="img" tabIndex={0} aria-label={`${more} more: ${hiddenNames}`}>
            +{more}
          </AvatarGroupCount>
        </Tooltip>
      ) : null}
    </AvatarGroupBase>
  )
})

"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { TextLink } from "./text-link"

export type BrandCheck = "passed" | "issues" | "checking" | "not-run" | "none"

export interface AIDraftedMarkerProps extends Omit<React.ComponentPropsWithoutRef<"p">, "children"> {
  /** The person who asked for the draft. */
  name?: string
  /** An auto-draft has no one who asked: what started it takes the name's place, "a new enquiry arrived". */
  trigger?: React.ReactNode
  /** How the brand check went: passed, issues, checking or not-run; none where no brand check applies (a shift note, an incident summary). */
  check?: BrandCheck
  /** How many issues the check found. */
  issues?: number
  /** Where the issues are listed. The line links to them. */
  issuesHref?: string
  /** Who edited the draft since. The product runs the check again. */
  editedBy?: string
  /** The id of the draft it describes: the marker becomes that item's description. */
  describes?: string
}

/** One line on a draft: who asked for it, how the brand check went, and who edited it since. */
export const AIDraftedMarker = React.forwardRef<HTMLParagraphElement, AIDraftedMarkerProps>(function AIDraftedMarker(
  { name, trigger, check = "not-run", issues, issuesHref, editedBy, describes, id, className, ...rest },
  ref
) {
  const own = `${React.useId()}-drafted`
  const markerId = id ?? own

  // Tied to the draft as its description, so a screen reader hears it with the draft. Not a live region.
  React.useLayoutEffect(() => {
    if (!describes) return
    const draft = document.getElementById(describes)
    if (!draft) return
    const ids = (draft.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)
    if (!ids.includes(markerId)) draft.setAttribute("aria-describedby", [...ids, markerId].join(" "))
    return () => {
      const left = (draft.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((t) => t && t !== markerId)
      if (left.length) draft.setAttribute("aria-describedby", left.join(" "))
      else draft.removeAttribute("aria-describedby")
    }
  })

  // A board writes the count as text ("2").
  const n = Number(issues)
  const count = Number.isFinite(n) && n > 0 ? n : 0
  const found = `brand check found ${formatNumber(count)} ${count === 1 ? "issue" : "issues"}`
  const who =
    trigger !== undefined && trigger !== null && trigger !== "" ? (
      <>Drafted with AI when {trigger}</>
    ) : (
      <>Drafted with AI{name ? <> by {name}</> : null}</>
    )
  const result =
    check === "passed" ? (
      ", brand check passed"
    ) : check === "issues" ? (
      // The link names what it opens.
      <>, {issuesHref ? <TextLink href={issuesHref}>{found}</TextLink> : found}</>
    ) : check === "checking" ? (
      ", checking the brand"
    ) : check === "none" ? (
      // A note or a summary of a person's own words: the check that matters is the person's read, not the brand's.
      null
    ) : (
      ", brand check not run"
    )

  return (
    <p
      ref={ref}
      id={markerId}
      data-slot="ai-drafted-marker"
      data-check={check}
      className={cn("flex min-w-0 items-start gap-1.5 type-meta text-pretty text-text-muted", className)}
      {...rest}
    >
      <span aria-hidden="true" className="flex h-4.5 shrink-0 items-center text-ai">
        <Icon name="Sparkles" size={14} />
      </span>
      <span className="min-w-0 wrap-break-word">
        {who}
        {editedBy ? <>, edited by {editedBy}</> : null}
        {result}
      </span>
    </p>
  )
})

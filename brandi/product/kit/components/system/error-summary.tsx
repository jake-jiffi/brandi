"use client"

import * as React from "react"

import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export interface ErrorSummaryItem {
  /** The id of the control the error belongs to. */
  id: string
  /** Word for word the error its field shows. */
  message: string
}

export interface ErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string
  errors: ErrorSummaryItem[]
  /** Takes focus when it appears and whenever the errors change, so it is read first. */
  autoFocus?: boolean
  headingLevel?: 2 | 3 | 4
}

const CONTROL = "input:not([type=hidden]), select, textarea, button, [tabindex]"
// A heading's size follows its level, as Card's and FormSection's do.
const TITLE = {
  2: { type: "type-heading-lg", line: "h-7" },
  3: { type: "type-heading", line: "h-6" },
  4: { type: "type-heading-sm", line: "h-5" },
} as const

/** Moves focus to an error's control (the first inside a group), with its label in view. */
function focusField(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  const control = target.matches(CONTROL) ? target : (target.querySelector<HTMLElement>(CONTROL) ?? target)
  control.focus({ preventScroll: true })
  const label = control.id ? document.querySelector(`label[for="${CSS.escape(control.id)}"]`) : null
  ;(label ?? control).scrollIntoView({ block: "center" })
}

/** After a failed save: a titled list of what stopped it, each line a link to its field. */
export const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { title = "Fix these and try again", errors, autoFocus = true, headingLevel = 2, className, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const titleId = React.useId()
  // A new set of errors (another failed save) takes focus again; a re-render with the same set does not.
  const signature = errors.map((e) => `${e.id}:${e.message}`).join("\n")
  React.useEffect(() => {
    if (autoFocus && signature) own.current?.focus()
  }, [autoFocus, signature])

  if (!errors.length) return null
  const level = TITLE[headingLevel] ? headingLevel : 2
  const Heading = `h${level}` as "h2"
  return (
    <div
      ref={merged}
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
      data-slot="error-summary"
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2 rounded-md border border-danger-line bg-danger-surface px-5 py-4",
        className
      )}
      {...rest}
    >
      {/* The icon's box is the title's line height, so it centres on the first line. */}
      <span className={cn("flex items-center text-danger", TITLE[level].line)}>
        <Icon name="CircleAlert" size={18} />
      </span>
      <Heading id={titleId} data-slot="error-summary-title" className={cn(TITLE[level].type, "text-text-strong")}>
        {title}
      </Heading>
      <ul data-slot="error-summary-list" className="col-start-2 flex flex-col gap-2">
        {errors.map((error, index) => (
          <li key={`${error.id}-${index}`}>
            <a
              href={`#${error.id}`}
              data-slot="error-summary-link"
              className="group inline-flex min-h-6 items-center rounded-xs pointer-coarse:min-h-10"
              onClick={(event) => {
                event.preventDefault()
                focusField(error.id)
              }}
            >
              {/* Colour and underline on the text, so a canvas's own link styles cannot override them. */}
              <span className="type-body text-danger underline underline-offset-4 group-hover:decoration-2">{error.message}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
})

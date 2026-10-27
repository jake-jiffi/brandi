"use client"

import * as React from "react"

import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** What a Field hands the control inside it. */
interface FieldContextValue {
  /** The id the control should take when it has none of its own. */
  id: string
  labelId: string
  /** The label as text, when it is text: a NumberInput names its step buttons with it. */
  labelText?: string
  describedBy?: string
  invalid: boolean
  required: boolean
  /** A control's own check (NumberInput's, when the person leaves it) reports its message here. */
  report: (message: string | null) => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

const join = (...ids: Array<string | false | null | undefined>) => ids.filter(Boolean).join(" ") || undefined
const shows = (node: React.ReactNode) => node !== undefined && node !== null && node !== false && node !== ""

/**
 * For a control built to sit in a Field: the Field's id, description, invalid and required, merged with the
 * control's own. The control renders data-field-control, so the Field leaves its attributes to React.
 */
export function useFieldControl(own: { id?: string; describedBy?: string; invalid?: boolean; required?: boolean }) {
  const field = React.useContext(FieldContext)
  const invalid = Boolean(own.invalid || field?.invalid)
  const required = Boolean(own.required || field?.required)
  return {
    field,
    invalid,
    required,
    props: {
      id: own.id ?? field?.id,
      "aria-describedby": join(own.describedBy, field?.describedBy),
      "aria-invalid": invalid || undefined,
      "aria-required": required || undefined,
      "data-field-control": "",
    },
  }
}

// What counts as the control when it is plain markup rather than a system component.
const PLAIN_CONTROL = 'input:not([type="hidden"]), textarea, select, [role="combobox"], [role="spinbutton"], [role="textbox"], [role="searchbox"]'

function findControl(slot: HTMLElement | null): HTMLElement | null {
  if (!slot) return null
  const own = slot.querySelector<HTMLElement>("[data-field-control]")
  if (own) return own
  for (const el of Array.from(slot.querySelectorAll<HTMLElement>(PLAIN_CONTROL))) {
    if (el.getAttribute("aria-hidden") !== "true") return el
  }
  return null
}

export interface FieldProps {
  /** A noun in sentence case, with no colon. */
  label: React.ReactNode
  /** The format, or why it matters. An error replaces it. */
  hint?: React.ReactNode
  /** What is wrong and how to fix it. Set it when the person leaves the field or saves, never while they type. */
  error?: React.ReactNode
  /** Shows "(optional)". Mark optional fields, not required ones. */
  optional?: boolean
  /** Sets required and aria-required on the control, with no visible marker. */
  required?: boolean
  /** The id to give the control. A control that already has an id keeps it, and the label follows it. */
  htmlFor?: string
  className?: string
  style?: React.CSSProperties
  /** One control. */
  children?: React.ReactNode
}

/** One control with its label above it, an optional marker, a hint and an error, wired together. */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, optional = false, required = false, htmlFor, className, style, children },
  ref
) {
  const base = React.useId()
  const assigned = htmlFor ?? `${base}-control`
  const labelId = `${base}-label`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const [controlId, setControlId] = React.useState(assigned)
  const [reported, report] = React.useState<string | null>(null)
  const message = shows(error) ? error : reported
  const invalid = shows(message)
  const describedBy = invalid ? errorId : shows(hint) ? hintId : undefined
  const slot = React.useRef<HTMLDivElement>(null)
  // What this Field last set on a plain control, so it can take back exactly that and nothing else.
  const wired = React.useRef<{ describedBy?: string; invalid: boolean; required: boolean }>({ invalid: false, required: false })

  // Find the control inside whatever wraps it (a canvas wraps every component in a plain element), give it an
  // id if it has none, and point the label at the id it ends up with. A plain control (markup, or a library's)
  // is wired here; a system control wires itself through the context. After every render on purpose: the control
  // can change with no prop changing, and setControlId fires only when the id differs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const control = findControl(slot.current)
    if (!control) return
    if (!control.id) control.id = assigned
    if (control.id !== controlId) setControlId(control.id)
    if (control.hasAttribute("data-field-control")) return
    const before = wired.current
    const theirs = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((t) => t && t !== before.describedBy)
    const next = join(...theirs, describedBy)
    if (next) control.setAttribute("aria-describedby", next)
    else control.removeAttribute("aria-describedby")
    if (invalid) control.setAttribute("aria-invalid", "true")
    else if (before.invalid) control.removeAttribute("aria-invalid")
    if (required) {
      control.setAttribute("aria-required", "true")
      if ("required" in control) (control as HTMLInputElement).required = true
    } else if (before.required) {
      control.removeAttribute("aria-required")
      if ("required" in control) (control as HTMLInputElement).required = false
    }
    wired.current = { describedBy, invalid, required }
  })

  const labelText = typeof label === "string" ? label : undefined
  const context = React.useMemo<FieldContextValue>(
    () => ({ id: assigned, labelId, labelText, describedBy, invalid, required, report }),
    [assigned, labelId, labelText, describedBy, invalid, required]
  )

  return (
    <div ref={ref} data-slot="field" className={cn("flex min-w-0 flex-col", className)} style={style}>
      <Label
        id={labelId}
        htmlFor={controlId}
        className="mb-1.5 block w-fit"
        onClick={(event) => {
          // A label activates a button it names, which would open a Select. Focus it instead, as a native
          // select does.
          const control = findControl(slot.current)
          if (control?.tagName === "BUTTON") {
            event.preventDefault()
            control.focus()
          }
        }}
      >
        {label}
        {optional ? <span className="type-body text-text-muted"> (optional)</span> : null}
      </Label>
      <FieldContext.Provider value={context}>
        <div ref={slot} data-slot="field-control" className="flex min-w-0 flex-col">
          {children}
        </div>
      </FieldContext.Provider>
      {shows(hint) && !invalid ? (
        <p id={hintId} data-slot="field-hint" className="mt-1.5 type-meta text-text-muted">
          {hint}
        </p>
      ) : null}
      {/* Polite, and here from the start, so an error is spoken when it appears and never on load. */}
      <div data-slot="field-message" aria-live="polite">
        {invalid ? (
          <FieldError id={errorId} role={undefined} className="mt-1.5">
            {message}
          </FieldError>
        ) : null}
      </div>
    </div>
  )
})

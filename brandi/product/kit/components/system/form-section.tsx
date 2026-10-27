"use client"

import * as React from "react"

import { Card as CardBase } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { cardNesting } from "./card"

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode
  /** Why the fields matter or who sees them: "Only finance can see this". */
  description?: React.ReactNode
  /** `split`: the title beside the fields, stacking above them when the section is narrow. `stacked`: always above. */
  layout?: "split" | "stacked"
  /** 2 by default; 3 under another heading. */
  headingLevel?: 2 | 3 | 4
}

// A heading's size follows its level, as Card's does: heading-lg for a section of the page.
const TITLE = { 2: "type-heading-lg", 3: "type-heading", 4: "type-heading-sm" } as const

/** Related fields in a card, with the title and description beside them or above. */
export const FormSection = React.forwardRef<HTMLElement, FormSectionProps>(function FormSection(
  { title, description, layout = "split", headingLevel = 2, className, children, ...rest },
  ref
) {
  const nested = React.useContext(cardNesting)
  // A board passes "3" as text; anything but 3 or 4 is the default h2, never an element that is no heading.
  const level = String(headingLevel) === "3" ? 3 : String(headingLevel) === "4" ? 4 : 2
  const Heading = `h${level}` as "h2"
  return (
    <section ref={ref} data-slot="form-section" data-layout={layout} className={cn("@container", className)} {...rest}>
      {/* Split by the section's own width, never the window's. */}
      <div className={cn("grid gap-x-8 gap-y-4", layout === "split" && "@min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]")}>
        <div data-slot="form-section-header" className="flex flex-col gap-1">
          <Heading className={cn(TITLE[level], "text-text-strong")}>{title}</Heading>
          {description != null ? <p className="max-w-measure type-body text-text-muted">{description}</p> : null}
        </div>
        <CardBase
          data-slot="form-section-fields"
          className={cn(
            "gap-5 overflow-visible p-6 @max-[359px]:p-4",
            nested && "rounded-none border-0 bg-transparent p-0 shadow-none @max-[359px]:p-0"
          )}
        >
          <cardNesting.Provider value={true}>{children}</cardNesting.Provider>
        </CardBase>
      </div>
    </section>
  )
})

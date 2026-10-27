"use client"

import * as React from "react"

import { Accordion as AccordionBase, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export interface AccordionSection {
  /** Stable and unique: `defaultOpen` names sections by it. */
  id: string
  /** The section's heading, a noun phrase or the question people ask. */
  title: string
  /** What opens. A string becomes a paragraph capped at the measure. */
  content: React.ReactNode
}

export interface AccordionProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "dir"> {
  /** The sections, as data. */
  items: AccordionSection[]
  /** The ids of the sections open at first. */
  defaultOpen?: string[]
  /** The level of each section's heading, so no page skips one. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * Sections that open and close in place: help, frequently asked questions, long settings. Each header is
 * a button with aria-expanded inside a heading, and opening one leaves the others as they were.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, defaultOpen, headingLevel = 3, className, ...rest },
  ref
) {
  const sections = items ?? []
  return (
    <AccordionBase
      ref={ref}
      type="multiple"
      defaultValue={defaultOpen}
      className={cn(sections.length > 0 && "border-y border-line", className)}
      {...rest}
    >
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger headingLevel={headingLevel}>{section.title}</AccordionTrigger>
          <AccordionContent>
            {typeof section.content === "string" ? <p className="max-w-measure text-pretty">{section.content}</p> : section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionBase>
  )
})

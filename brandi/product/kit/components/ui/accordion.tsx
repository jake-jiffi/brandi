"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/accordion.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { ChevronDownIcon } from "lucide-react"

const Accordion = React.forwardRef(function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>, ref: React.ForwardedRef<any>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, accordion): the divider is the system's hairline.
const AccordionItem = React.forwardRef(function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>, ref: React.ForwardedRef<any>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-line not-last:border-b", className)}
      {...props}
      ref={ref}
    />
  )
})

type HeadingLevel = 2 | 3 | 4 | 5 | 6

// Patched (07-starter.md, accordion): the heading level is a prop, so no page skips one. The header is a
// real heading in the strong text colour, a full step above the text it opens, at least 48px tall on every
// screen, inset 12px so its hover wash fills the row (no underline). One chevron turns, only when motion is
// welcome. Focus is the base styles' outline.
const AccordionTrigger = React.forwardRef(function AccordionTrigger({
  className,
  children,
  headingLevel = 3,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { headingLevel?: HeadingLevel }, ref: React.ForwardedRef<any>) {
  const level = [2, 3, 4, 5, 6].includes(Number(headingLevel)) ? Number(headingLevel) : 3
  const Heading = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6"
  // The type sits on the heading itself, so the heading measures its real size, and the button inherits it.
  return (
    <AccordionPrimitive.Header asChild>
      <Heading data-slot="accordion-header" className="m-0 flex type-heading-lg text-text-strong">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            "group/accordion-trigger relative flex min-h-12 flex-1 items-center justify-between gap-4 rounded-sm px-3 py-3 text-left transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-text-muted",
            className
          )}
          {...props}
          ref={ref}
        >
          {children}
          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            aria-hidden="true"
            className="pointer-events-none shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-aria-expanded/accordion-trigger:rotate-180"
          />
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  )
})

// Patched (07-starter.md, accordion): the system's reading size, because what opens is prose, and the height
// animates only when motion is welcome. Under reduced motion a section appears and goes at once.
const AccordionContent = React.forwardRef(function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>, ref: React.ForwardedRef<any>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden type-body-lg text-text motion-safe:data-open:animate-accordion-down motion-safe:data-closed:animate-accordion-up"
      {...props}
      ref={ref}
    >
      <div
        className={cn(
          "px-3 pt-0 pb-4 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-link-hover [&_p:not(:last-child)]:mb-3",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

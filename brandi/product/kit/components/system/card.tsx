"use client"

import * as React from "react"

import {
  Card as CardBase,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

/**
 * True inside a card. Never a card inside a card: anything that would draw a second card (a Card, a
 * FormSection) draws its content without the box instead.
 */
export const cardNesting = React.createContext(false)

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Says what the card shows, in sentence case. Never a small uppercase label above it. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** Buttons at the top right. They stay pressable when the card is a link. */
  actions?: React.ReactNode
  footer?: React.ReactNode
  icon?: IconName
  /** The title becomes a link that covers the card; buttons inside stay pressable. */
  href?: string
  /** A chevron at the end of the title's line, the cue that the whole card opens something, as ListRow has. */
  chevron?: boolean
  /** Inside a pane: no shadow. */
  flat?: boolean
  /** Lifts on hover. */
  interactive?: boolean
  selected?: boolean
  /** No body padding, for tables and lists. */
  flush?: boolean
  headingLevel?: 2 | 3 | 4
  as?: "div" | "section" | "article" | "li"
}

// The inset steps down on a narrow card, by the card's own width.
const INSET_X = "px-6 @max-[359px]:px-4"
const INSET_TOP = "pt-6 @max-[359px]:pt-4"
const INSET_BOTTOM = "pb-6 @max-[359px]:pb-4"
// The title's type at each level, as CardTitle sets it: the actions take its line's height from it.
const TITLE_TYPE = { 2: "type-heading-lg", 3: "type-heading", 4: "type-heading-sm" } as const

/** The container on the canvas: a title, an optional description and actions, a body and a footer. */
export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    description,
    actions,
    footer,
    icon,
    href,
    chevron = false,
    flat = false,
    interactive = false,
    selected = false,
    flush = false,
    headingLevel = 2,
    as = "div",
    className,
    children,
    ...rest
  },
  ref
) {
  const nested = React.useContext(cardNesting)
  const Link = useLink()
  // A board passes "3" as text; anything but 3 or 4 is the default h2, never an element that is no heading.
  const level = String(headingLevel) === "3" ? 3 : String(headingLevel) === "4" ? 4 : 2
  const hasHeader = title != null || description != null || actions != null
  const hasBody = children != null && children !== false
  const box = !nested

  return (
    <CardBase
      ref={ref}
      as={as}
      data-flat={flat || nested || undefined}
      data-selected={selected || undefined}
      data-nested={nested || undefined}
      className={cn(
        "@container relative gap-0 py-0",
        // Inside another card: no box, and more space above its title than below it.
        nested && "mt-2 overflow-visible rounded-none border-0 bg-transparent shadow-none",
        box && flat && "shadow-none",
        box && interactive && "transition-[translate,box-shadow] duration-(--duration-base) ease-standard hover:shadow-md motion-safe:hover:-translate-y-0.5",
        box && selected && "border-selected-line bg-selected ring-1 ring-selected-line forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:outline-[color:Highlight] forced-colors:outline-solid",
        className
      )}
      {...rest}
    >
      <cardNesting.Provider value={true}>
        {hasHeader ? (
          <CardHeader
            className={cn(
              // A row that wraps: the actions sit beside the title while it keeps 8rem, and drop below it in a card
              // too narrow for both, never past the card's edge.
              "flex flex-wrap gap-x-4 gap-y-3",
              box && INSET_X,
              box && INSET_TOP,
              box && !hasBody && !footer && INSET_BOTTOM,
              nested && "px-0"
            )}
          >
            {title != null || description != null ? (
              <div data-slot="card-heading" className="flex min-w-0 grow basis-32 flex-col gap-1">
                {title != null ? (
                  <CardTitle as={`h${level}`} className={cn((icon || chevron) && "flex items-center gap-2")}>
                    {icon ? <Icon name={icon} size={18} className="text-text-muted" /> : null}
                    {href ? (
                      <Link href={href} data-slot="card-link" className="rounded-xs after:absolute after:inset-0">
                        {/* The underline sits on the text, so a canvas's own link styles cannot restyle it. */}
                        <span className="underline-offset-4 group-hover/card:underline">{title}</span>
                      </Link>
                    ) : (
                      title
                    )}
                    {chevron ? (
                      <span aria-hidden="true" data-slot="card-chevron" className="ms-auto flex shrink-0 text-text-subtle">
                        <Icon name="ChevronRight" />
                      </span>
                    ) : null}
                  </CardTitle>
                ) : null}
                {description != null ? <CardDescription className="max-w-measure">{description}</CardDescription> : null}
              </div>
            ) : null}
            {actions != null ? (
              // One title line tall, the buttons centred on it: a 32 to 44px button sits on the title's line without
              // making the header taller, and dropped below the title it still clears it. Its own text takes the body
              // style, not the title's.
              <CardAction className={cn("relative z-10 flex h-lh shrink-0 items-center gap-2", TITLE_TYPE[level])}>
                <div className="contents type-body">{actions}</div>
              </CardAction>
            ) : null}
          </CardHeader>
        ) : null}
        {hasBody ? (
          <CardContent
            className={cn(
              // Grows into a stretched card, so the footer sits at its foot: cards in a row end on one line.
              "grow gap-4",
              flush ? "px-0" : box ? INSET_X : "px-0",
              hasHeader ? (nested ? "pt-2" : "pt-4") : box && !flush && INSET_TOP,
              box && !flush && !footer && INSET_BOTTOM
            )}
          >
            {children}
          </CardContent>
        ) : null}
        {footer != null ? (
          <CardFooter
            className={cn(
              "relative z-10 gap-3 border-t border-line py-4 type-meta text-text-muted",
              // A flush table or list runs straight into the footer's hairline.
              (hasBody ? !flush : hasHeader) && "mt-6 @max-[359px]:mt-4",
              box ? cn(INSET_X, "bg-surface-subtle") : "px-0"
            )}
          >
            {footer}
          </CardFooter>
        ) : null}
      </cardNesting.Provider>
    </CardBase>
  )
})

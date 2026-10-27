"use client"

import * as React from "react"

import { Item, ItemActions, ItemContent, ItemMedia } from "@/components/ui/item"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Avatar } from "./avatar"
import { Badge, type BadgeTone } from "./badge"
import { cardNesting } from "./card"
import { Icon } from "./icon"
import { Tooltip, useTruncated } from "./tooltip"

/** A badge as data, so a board can pass it: the word carries the state, the tone backs it up. */
export interface ListRowBadge {
  label: string
  tone?: BadgeTone
}

/** Set by List: inside one, rows are list items, with a hairline between them when it is divided. */
export const listRowContext = React.createContext<{ inList: boolean; divided: boolean }>({ inList: false, divided: false })

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> {
  /** Names the record, in bold. */
  title: React.ReactNode
  /** What it is, and what is next: "Invoice 1042 · due Friday". */
  meta?: React.ReactNode
  /** A person: their name (initials on a tint), or a name and a photo. */
  avatar?: string | { name: string; src?: string }
  /** An icon tile, for a record that is not a person. Ignored beside an avatar. */
  icon?: IconName
  /** One badge at the end of the row. It moves under the text on a narrow list, whole. */
  badge?: ListRowBadge | React.ReactNode
  /** Badges on a line of their own under the meta line, as a table's phone list shows them. */
  badges?: ListRowBadge[]
  /** A value at the end, such as an amount. */
  trailing?: React.ReactNode
  /** A chevron at the end, for a row that opens a record. */
  chevron?: boolean
  /** The open row: the record shown beside the list. */
  selected?: boolean
  /** Shows a dot, and says "(unread)" to screen readers. */
  unread?: boolean
  /** Opens a record: the whole row is the link. */
  href?: string
  /** Opens a record or acts: the whole row is the button. */
  onClick?: () => void
  /** A control before the lead, such as a selection checkbox. Pressing it never opens the row. */
  leading?: React.ReactNode
  /** A control at the far end, such as the row's menu. It stays pressable, and it stays on the right. */
  action?: React.ReactNode
}

const isBadge = (b: unknown): b is ListRowBadge =>
  typeof b === "object" && b !== null && !React.isValidElement(b) && typeof (b as ListRowBadge).label === "string"

// In a boxed List the first and last rows round their corners to the box's, so a tint or a wash never squares
// them off.
const CORNERS =
  "[[data-boxed]>&:first-child]:rounded-t-[calc(var(--radius-md)-1px)] [[data-boxed]>&:last-child]:rounded-b-[calc(var(--radius-md)-1px)]"

/**
 * One record in a List: a lead, a bold title, a meta line, and a trailing badge, value or chevron. A row
 * that opens something is one link or button across the whole row, named by its title.
 */
export const ListRow = React.forwardRef<HTMLElement, ListRowProps>(function ListRow(
  {
    title,
    meta,
    avatar,
    icon,
    badge,
    badges,
    trailing,
    chevron = false,
    selected = false,
    unread = false,
    href,
    onClick,
    leading,
    action,
    className,
    ...rest
  },
  ref
) {
  const { inList, divided } = React.useContext(listRowContext)
  // Inside a card, rows line up with the card's own inset.
  const inCard = React.useContext(cardNesting)
  const Link = useLink()
  const id = React.useId()
  const titleId = `${id}-title`
  const metaId = `${id}-meta`
  const sideId = `${id}-side`
  const interactive = Boolean(href || onClick)
  // A row that opens a record cuts long text on a wide list, and offers it in full on hover, on keyboard focus
  // and on a long press. A row that opens nothing has no way to offer it, so it wraps instead.
  const [titleEl, setTitleEl] = React.useState<HTMLElement | null>(null)
  const [metaEl, setMetaEl] = React.useState<HTMLElement | null>(null)
  const titleCut = useTruncated(interactive ? titleEl : null)
  const metaCut = useTruncated(interactive ? metaEl : null)
  // Hidden from screen readers, a row's content is inert too, so nothing inside it (a cut badge's own tooltip) can
  // take focus where no one could hear it. Set by hand: React 18 and 19 read an inert prop differently.
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    contentRef.current?.toggleAttribute("inert", interactive)
  }, [interactive])

  const person = typeof avatar === "string" ? { name: avatar } : avatar && typeof avatar === "object" ? avatar : null
  const hasMeta = meta !== undefined && meta !== null && meta !== false && meta !== ""
  const rowBadges = Array.isArray(badges) ? badges.filter(isBadge) : []
  const hasBadge = badge !== undefined && badge !== null && badge !== false
  const hasTrailing = trailing !== undefined && trailing !== null && trailing !== false && trailing !== ""
  const quiet = selected ? "text-text-muted" : "text-text-subtle"
  // Cut on a wide list, wrapped under 480px of list: on a phone the whole line is always there.
  const fit = interactive ? "truncate @max-[479px]:whitespace-normal @max-[479px]:wrap-anywhere" : "wrap-anywhere"

  // When the row wraps, the lead stays beside the title rather than floating in the middle of the text.
  const lead = person ? (
    <ItemMedia data-slot="list-row-lead" className="@max-[479px]:self-start">
      <Avatar name={person.name} src={person.src} size={hasMeta ? 40 : 32} />
    </ItemMedia>
  ) : icon ? (
    <ItemMedia data-slot="list-row-lead" className="@max-[479px]:self-start">
      <span className="flex size-10 items-center justify-center rounded-sm bg-surface-sunken text-text-muted">
        <Icon name={icon} size={20} />
      </span>
    </ItemMedia>
  ) : null

  // A short value alone (an amount, a count) stays on the right at any width: moved under the meta line on a
  // phone it took a line of its own for a few characters. A badge still moves under the text.
  const inline = !hasBadge && hasTrailing && (typeof trailing === "string" || typeof trailing === "number")

  const side =
    hasBadge || hasTrailing ? (
      // Never squeezed: the text gives way first, and under 480px of list the badge moves under it, whole.
      <ItemActions id={sideId} data-slot="list-row-side" className="shrink-0 flex-wrap">
        {hasBadge ? isBadge(badge) ? <Badge tone={badge.tone ?? "neutral"}>{badge.label}</Badge> : (badge as React.ReactNode) : null}
        {hasTrailing ? (
          typeof trailing === "string" || typeof trailing === "number" ? (
            <span className="type-body whitespace-nowrap text-text tabular-nums">{trailing}</span>
          ) : (
            trailing
          )
        ) : null}
      </ItemActions>
    ) : null

  const content = (
    <div
      ref={contentRef}
      data-slot="list-row-content"
      // A row that opens something is read through its link, so the same words are not read twice.
      aria-hidden={interactive || undefined}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      {lead}
      {/* The text keeps at least 192px: on a crowded row the badge and value move under it, whole, rather than
          cutting the title to nothing. Under 480px of list they always go under it. */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-x-3 gap-y-1.5",
          inline ? "flex-nowrap @max-[479px]:items-start" : "flex-wrap @max-[479px]:flex-col @max-[479px]:flex-nowrap @max-[479px]:items-start"
        )}
      >
        <ItemContent className={cn("w-full min-w-0 gap-0.5", inline ? "flex-1" : "flex-[1_1_12rem] @max-[479px]:flex-none")}>
          <span className="flex min-w-0 items-center gap-2">
            <span ref={setTitleEl} id={titleId} data-slot="list-row-title" className={cn("min-w-0 type-heading-sm text-text-strong", fit)}>
              {title}
              {unread ? <span className="sr-only"> (unread)</span> : null}
            </span>
            {unread ? <span aria-hidden="true" data-slot="list-row-unread" className="size-2 shrink-0 rounded-full bg-highlight" /> : null}
          </span>
          {hasMeta ? (
            <span ref={setMetaEl} id={metaId} data-slot="list-row-meta" className={cn("block min-w-0 type-meta", quiet, fit)}>
              {meta}
            </span>
          ) : null}
          {rowBadges.length ? (
            <span data-slot="list-row-badges" className="mt-1.5 flex flex-wrap gap-1.5">
              {rowBadges.map((b, i) => (
                <Badge key={`${b.label}-${i}`} tone={b.tone ?? "neutral"}>
                  {b.label}
                </Badge>
              ))}
            </span>
          ) : null}
        </ItemContent>
        {side}
      </div>
      {chevron ? <Icon name="ChevronRight" className="shrink-0 text-text-subtle" /> : null}
    </div>
  )

  const describedBy = [hasMeta ? metaId : null, rowBadges.length ? `${id}-badges` : null, side ? sideId : null].filter(Boolean).join(" ") || undefined
  // Focus draws 4px inside the row's edge, inside the open row's own edge, so a focused open row shows both. On
  // the open row it draws in text-strong: the focus colour can fall under 3:1 on the selected tint (round 2).
  const actionClass = cn("block size-full rounded-[inherit] focus-visible:outline-offset-[-4px]", selected && "focus-visible:outline-text-strong")
  const actionProps = {
    "data-slot": "list-row-action",
    "aria-labelledby": titleId,
    "aria-describedby": describedBy,
    "aria-current": selected ? ("true" as const) : undefined,
    className: actionClass,
  }
  const cutWords =
    titleCut || metaCut ? (
      <span className="flex flex-col gap-0.5">
        {titleCut ? <span>{title}</span> : null}
        {metaCut ? <span>{meta}</span> : null}
      </span>
    ) : null

  const Root = (inList ? "li" : "div") as "li"
  return (
    // The classes go to Item, which merges them with its own; the element is a list item inside a List.
    <Item
      asChild
      className={cn(
        "@container relative flex-nowrap gap-3 rounded-none border-0 py-3",
        inCard ? "px-6 @max-[359px]:px-4" : "px-4",
        // Item draws a border of its own; the row keeps only the hairline above it, in a divided list.
        divided && "border-t border-line first:border-t-0",
        CORNERS,
        interactive && !selected && "hover:bg-hover active:bg-pressed",
        // The open row: the strong tint and a selected-line edge. Forced colours take both away, so it gets an
        // outline there.
        selected &&
          "bg-selected-strong shadow-[inset_0_0_0_1px_var(--selected-line)] forced-colors:outline-2 forced-colors:outline-offset-[-2px] forced-colors:outline-[color:Highlight] forced-colors:outline-solid",
        className
      )}
    >
      <Root
        ref={ref as React.Ref<HTMLLIElement>}
        data-slot="list-row"
        data-selected={selected || undefined}
        data-unread={unread || undefined}
        aria-current={selected && !interactive ? "true" : undefined}
        {...rest}
      >
        {leading ? (
          // A checkbox lines up with the title's line, however many lines the row runs to.
          <div data-slot="list-row-leading" className="relative z-[2] flex shrink-0 items-center self-start pt-px">
            {leading}
          </div>
        ) : null}
        {/* The row's link lies over the whole row, under its controls. It comes after the leading control in the
            source, so Tab meets them in the order they are seen: the checkbox, the row, its action. */}
        {interactive ? (
          <Tooltip content={cutWords} className="absolute inset-0 z-[1] flex rounded-[inherit]">
            {href ? (
              <Link href={href} onClick={onClick ? () => onClick() : undefined} {...actionProps} />
            ) : (
              <button type="button" onClick={() => onClick?.()} {...actionProps} />
            )}
          </Tooltip>
        ) : null}
        {content}
        {rowBadges.length ? (
          <span id={`${id}-badges`} hidden>
            {rowBadges.map((b) => b.label).join(", ")}
          </span>
        ) : null}
        {action ? (
          <div data-slot="list-row-end" className="relative z-[2] flex shrink-0 items-center">
            {action}
          </div>
        ) : null}
      </Root>
    </Item>
  )
})

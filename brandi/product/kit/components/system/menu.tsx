"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  dropdownMenuItemClass,
  dropdownMenuLabelClass,
  dropdownMenuPanelClass,
  dropdownMenuSeparatorClass,
} from "@/components/ui/dropdown-menu"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { portalTheme } from "./dialog"
import { Icon } from "./icon"

/** One action in a menu. */
export interface MenuAction {
  label: string
  icon?: IconName
  /** A second line, for an action that needs explaining. */
  description?: string
  /** Shown as a key. A single key also runs the action while the menu is open, unless Root turns single-key shortcuts off. */
  shortcut?: string
  /** Danger text. Destructive actions go last, after a separator, and open a confirmation. */
  danger?: boolean
  /** Stays visible and does nothing. */
  disabled?: boolean
  /** A check in the icon's place. `false` keeps the space, so the labels line up. */
  checked?: boolean
  onSelect?: () => void
}

export type MenuEntry = MenuAction | "separator" | { group: string }

export interface MenuProps {
  /** Actions, `"separator"`, or `{ group: "Label" }` for a group's label. Six actions or fewer is best. */
  items: MenuEntry[]
  /** The element that opens it. Without one, a ghost icon button with three dots. */
  trigger?: React.ReactElement
  /** Names the trigger: "More actions for [record]". Needed when the trigger has no text. */
  label?: string
  align?: "start" | "center" | "end"
  placement?: "top" | "right" | "bottom" | "left"
  /** Draws the open menu in place, with no trigger and no portal, for a design on a canvas. */
  inline?: boolean
  /** Shows it open under its trigger, for a design on a canvas: a still picture with no live layer, so the board keeps its Escape key and its tab order. */
  open?: boolean
  className?: string
}

/** The key style the system's menus share. Hidden on touch screens, which have no keyboard to press it on. */
export const keyClass =
  "inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-xs border border-line bg-surface-subtle px-1 type-caption text-text-muted pointer-coarse:hidden"

const isAction = (entry: MenuEntry): entry is MenuAction => typeof entry === "object" && "label" in entry

function ActionContent({ action, icon }: { action: MenuAction; icon: boolean }) {
  return (
    <>
      {icon && action.icon ? <Icon name={action.icon} className={action.danger ? undefined : "text-text-muted"} /> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span data-slot="menu-action-label">{action.label}</span>
        {action.description ? <span data-slot="menu-action-description" className="type-meta text-text-muted">{action.description}</span> : null}
      </span>
      {action.shortcut ? <kbd className={cn(keyClass, "ml-3")}>{action.shortcut}</kbd> : null}
    </>
  )
}

// Where a menu drawn for a design sits against its trigger: the side it prefers, then the edge it lines up with.
const SIDE = { bottom: "top-full mt-1", top: "bottom-full mb-1", left: "right-full mr-1", right: "left-full ml-1" } as const
const ALONG_X = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" } as const
const ALONG_Y = { start: "top-0", center: "top-1/2 -translate-y-1/2", end: "bottom-0" } as const

/** Actions on one thing, opened from an overflow button or any trigger. */
export const Menu = React.forwardRef<HTMLElement, MenuProps>(function Menu(
  { items, trigger, label, align = "end", placement = "bottom", inline = false, open: shownForDesign = false, className },
  ref
) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef<HTMLElement>(ref, triggerRef)
  const wasOpen = React.useRef(false)
  const closing = React.useRef(false)
  const [theme, setTheme] = React.useState<"light" | "dark" | undefined>()
  React.useLayoutEffect(() => {
    // A portal sits outside the region it opened from, so it copies its trigger's theme where that
    // differs from the page's.
    if (open) setTheme(portalTheme(triggerRef.current))
    closing.current = !open && wasOpen.current
    wasOpen.current = open
  }, [open])
  // On close, focus goes back to the trigger at once, not on Radix's timer, which leaves it on the page
  // body for a moment. A passive effect runs after Radix has let go of its focus trap, so the move holds.
  // When an action opened a dialog, or a click outside moved focus on, focus stays where it went.
  React.useEffect(() => {
    if (!closing.current) return
    closing.current = false
    const now = document.activeElement
    if (!now || now === document.body || contentRef.current?.contains(now)) triggerRef.current?.focus()
  }, [open])

  const actions = items.filter(isAction)
  // Labels line up: when any action has an icon or a check, the others are inset to match.
  const lead = actions.some((a) => a.icon || a.checked !== undefined)

  // The open menu as a still picture, for a design: no Radix layer, so nothing on the board loses its
  // Escape or gains a hidden tab stop. Its actions can still be clicked.
  const picture = (place?: string, panelRef?: React.Ref<HTMLDivElement>) => (
    <div ref={panelRef} role="menu" aria-label={label} data-slot="dropdown-menu-content" data-inline="" className={cn(dropdownMenuPanelClass, place, className)}>
      {items.map((entry, i) => {
        if (entry === "separator") return <div key={i} role="separator" data-slot="dropdown-menu-separator" className={dropdownMenuSeparatorClass} />
        if (!isAction(entry)) return <div key={i} data-slot="dropdown-menu-label" data-inset={lead || undefined} className={dropdownMenuLabelClass}>{entry.group}</div>
        const checkable = entry.checked !== undefined
        return (
          <div
            key={i}
            role={checkable ? "menuitemcheckbox" : "menuitem"}
            aria-checked={checkable ? entry.checked : undefined}
            aria-disabled={entry.disabled || undefined}
            tabIndex={-1}
            data-slot={checkable ? "dropdown-menu-checkbox-item" : "dropdown-menu-item"}
            data-variant={entry.danger ? "destructive" : "default"}
            data-disabled={entry.disabled || undefined}
            data-inset={lead && !checkable && !entry.icon ? "" : undefined}
            className={dropdownMenuItemClass}
            onClick={entry.disabled ? undefined : entry.onSelect}
          >
            {checkable ? <span className="flex size-4 shrink-0 items-center justify-center">{entry.checked ? <Icon name="Check" /> : null}</span> : null}
            <ActionContent action={entry} icon={!checkable} />
          </div>
        )
      })}
    </div>
  )

  if (inline) {
    return picture(undefined, ref as React.Ref<HTMLDivElement>)
  }

  const opener = trigger ?? (
    <ButtonBase variant="ghost" size="icon" aria-label={label ?? "More actions"}>
      <Icon name="Ellipsis" />
    </ButtonBase>
  )

  if (shownForDesign) {
    const vertical = placement === "top" || placement === "bottom"
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} data-slot="menu-shown" className="relative inline-flex">
        {React.cloneElement(opener as React.ReactElement<Record<string, unknown>>, { "aria-haspopup": "menu", "aria-expanded": true, "data-state": "open", ...(trigger && label ? { "aria-label": label } : {}) })}
        {picture(cn("absolute z-(--z-popover) w-max", SIDE[placement], vertical ? ALONG_X[align] : ALONG_Y[align]))}
      </span>
    )
  }

  // While the menu is open, a single-key shortcut runs its action, as the reference did. Cmd, Ctrl and
  // Alt combinations are left to the page, and Root's shortcuts setting turns single keys off.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
    if (document.documentElement.dataset.shortcuts === "off") return
    const hit = actions.find((a) => !a.disabled && a.shortcut?.length === 1 && a.shortcut.toLowerCase() === event.key.toLowerCase())
    if (!hit) return
    event.preventDefault()
    setOpen(false)
    hit.onSelect?.()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild ref={mergedRef} aria-label={label}>
        {opener}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={contentRef}
        align={align}
        side={placement}
        collisionPadding={8}
        data-theme={theme}
        className={cn(theme === "dark" && "dark", className)}
        onKeyDown={onKeyDown}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {items.map((entry, i) => {
          if (entry === "separator") return <DropdownMenuSeparator key={i} />
          if (!isAction(entry)) return <DropdownMenuLabel key={i} inset={lead || undefined}>{entry.group}</DropdownMenuLabel>
          if (entry.checked !== undefined) {
            return (
              <DropdownMenuCheckboxItem key={i} checked={entry.checked} disabled={entry.disabled} textValue={entry.label} onSelect={() => entry.onSelect?.()}>
                <ActionContent action={entry} icon={false} />
              </DropdownMenuCheckboxItem>
            )
          }
          return (
            <DropdownMenuItem
              key={i}
              variant={entry.danger ? "destructive" : "default"}
              disabled={entry.disabled}
              inset={lead && !entry.icon ? true : undefined}
              textValue={entry.label}
              onSelect={() => entry.onSelect?.()}
            >
              <ActionContent action={entry} icon />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

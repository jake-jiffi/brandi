"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Avatar } from "./avatar"
import { Icon } from "./icon"
import { Menu, type MenuEntry } from "./menu"
import { useRail } from "./nav-item"
import { Tooltip } from "./tooltip"

/** The signed-in person. */
export interface AccountUser {
  name: string
  /** Their role, as the product names it: "Owner". */
  role?: string
  /** A photo. Initials show without one. */
  src?: string
}

interface AccountButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  user: AccountUser
  /** The second line: the role, or the workspace someone is in. */
  detail?: string
}

/**
 * The account button at the foot of the rail: the person's avatar, their name and a second line, pressed
 * to open the account menu. Shared by Sidebar and WorkspaceSwitcher; icons only, the avatar alone.
 */
export const accountButton = React.forwardRef<HTMLButtonElement, AccountButtonProps>(function AccountButton(
  { user, detail, className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      data-slot="account-button"
      // 48px tall at least, growing when a name wraps: under WCAG 1.4.12 text spacing a long name cut short could
      // not be read whole anywhere but in the accessible name.
      className={cn(
        "flex min-h-12 w-full min-w-0 items-center gap-2.5 rounded-action px-3 py-1.5 text-left text-rail-text transition-colors duration-(--duration-fast) hover:bg-rail-hover aria-expanded:bg-rail-hover focus-visible:outline-rail-focus",
        "@max-[160px]/rail:size-10 @max-[160px]/rail:min-h-0 @max-[160px]/rail:justify-center @max-[160px]/rail:p-0 @max-[160px]/rail:pointer-coarse:size-11",
        className
      )}
      {...rest}
    >
      <Avatar name={user.name} src={user.src} size={32} aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col @max-[160px]/rail:hidden">
        <span className="type-label wrap-break-word text-rail-text-strong">{user.name}</span>
        {detail ? <span className="type-meta wrap-break-word text-rail-text">{detail}</span> : null}
      </span>
      <Icon name="ChevronsUpDown" className="text-rail-muted @max-[160px]/rail:hidden" />
    </button>
  )
})

/** One place someone can work in. */
export interface Workspace {
  value: string
  /** As people say it: "[Kestrel Maintenance]". */
  name: string
  /** The person's role there, shown under its name in the menu: "Owner". */
  role?: string
}

export interface WorkspaceSwitcherProps {
  /** The signed-in person: the account button shows them. */
  user: AccountUser
  /** Every workspace the person can switch to, the current one included. */
  workspaces: Workspace[]
  /** The current workspace's value. It shows on the account button. */
  value: string
  /** Called with the chosen workspace's value. The product switches, then sets `value`. */
  onChange?: (value: string) => void
  /** More of the account menu after a separator: settings, help, sign out. */
  items?: MenuEntry[]
  /** The workspaces' group label in the menu. */
  label?: string
  /** Shows the menu open, for a design on a canvas: a still picture with no live layer. */
  open?: boolean
  className?: string
}

/** Choosing the account, workspace or client someone is working in, from the account button. */
export const WorkspaceSwitcher = React.forwardRef<HTMLElement, WorkspaceSwitcherProps>(function WorkspaceSwitcher(
  { user, workspaces, value, onChange, items, label = "Workspaces", open, className },
  ref
) {
  const { inRail, collapsed } = useRail()
  const current = workspaces.find((w) => w.value === value) ?? workspaces[0]
  const role = current?.role ?? user.role
  // The visible lines first, so the name starts with what people see: "[Name], [Workspace], [Role], account menu".
  const name = [user.name, current?.name, role, "account menu"].filter(Boolean).join(", ")

  // Switching says where the person is now, once, politely. Never for the workspace the page loads in.
  // Worked out while rendering, so the words change in the same commit as the account button.
  const [said, setSaid] = React.useState("")
  const [was, setWas] = React.useState(current?.value)
  if (was !== current?.value) {
    setWas(current?.value)
    setSaid(current ? `Now in ${current.name}` : "")
  }

  const entries: MenuEntry[] = [
    { group: label },
    // Choosing the workspace someone is already in only closes the menu.
    ...workspaces.map((w) => ({ label: w.name, description: w.role, checked: w.value === current?.value, onSelect: () => (w.value === current?.value ? undefined : onChange?.(w.value)) })),
    ...(items?.length ? (["separator", ...items] as MenuEntry[]) : []),
  ]

  // The account button sits at the foot of the rail, so the menu opens above it, or beside the icons-only rail.
  const menu = (
    <Menu
      ref={ref}
      label={name}
      items={entries}
      trigger={React.createElement(accountButton, { user, detail: current?.name, className })}
      placement={inRail ? (collapsed ? "right" : "top") : "bottom"}
      align={inRail && collapsed ? "end" : "start"}
      open={open}
    />
  )
  // Drawn open for a design, the account button still fills its row and the menu is as wide as it, as live.
  const placed = open ? (
    <div className="flex min-w-0 *:data-[slot=menu-shown]:flex *:data-[slot=menu-shown]:w-full **:data-[slot=dropdown-menu-content]:min-w-full">{menu}</div>
  ) : (
    menu
  )

  return (
    <>
      {collapsed ? (
        <Tooltip content={[user.name, current?.name].filter(Boolean).join(", ")} placement="right">
          {placed}
        </Tooltip>
      ) : (
        placed
      )}
      <span role="status" data-slot="workspace-switcher-status" className="sr-only">
        {said}
      </span>
    </>
  )
})

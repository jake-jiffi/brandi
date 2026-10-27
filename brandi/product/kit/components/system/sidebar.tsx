"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { BRAND } from "@/lib/brand"
import { useLink } from "@/lib/link"
import { PRODUCT } from "@/lib/product"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { drawerContext } from "./app-shell"
import { Avatar } from "./avatar"
import { Icon } from "./icon"
import { Kbd } from "./kbd"
import { Logo } from "./logo"
import { NavGroup, type NavGroupProps } from "./nav-group"
import { railContext, type NavItemProps } from "./nav-item"
import { ProductLockup } from "./product-lockup"
import { Tooltip } from "./tooltip"
import { accountButton as AccountButton, type AccountUser } from "./workspace-switcher"

export interface SidebarProps {
  /** The product's name for the lockup at the top. Defaults to the name in lib/product.ts. */
  product?: string
  /** Where the lockup links. Without it the lockup is not a link. */
  home?: string
  /** Icons only, 72px wide, with the labels as tooltips. Inside AppShell the shell's width decides. */
  collapsed?: boolean
  /** The search or ask button's label, or false for none. It shows when onSearch is set. */
  search?: string | false
  /** The key hint, in its Mac form. Command K or Control K runs onSearch from anywhere. An empty string turns both off. */
  shortcut?: string
  /** Opens the command menu. */
  onSearch?: () => void
  /** The signed-in person, at the foot: `{ name, role, src }`. */
  user?: AccountUser
  /** Pressing the account button. Without it the person shows, but nothing is pressable. */
  onUser?: () => void
  /** Replaces the account button: a WorkspaceSwitcher. Built in the board's script on a canvas. */
  account?: React.ReactNode
  /** The navigation as data, for a canvas: each is a NavGroup's props, with its items. */
  groups?: NavGroupProps[]
  /** Settings and help, above the account: NavItems' props, or elements. */
  footer?: React.ReactNode | NavItemProps[]
  /** Its height follows its contents instead of filling its container. */
  autoHeight?: boolean
  /** Names the navigation landmark. */
  label?: string
  /** NavGroups, when they are not given as `groups`. */
  children?: React.ReactNode
  className?: string
}

// The width under which the rail is its icons-only column. Its look switches by container query at the same width.
const NARROW = 160

/** "⌘K" as aria-keyshortcuts reads it: the same key with Command or Control. */
function keyshortcuts(shortcut: string) {
  const key = shortcut.replace(/[⌘⌃⌥⇧\s]/g, "").toUpperCase()
  return key ? `Meta+${key} Control+${key}` : undefined
}

/** The rail: the product lockup, search or ask, the navigation groups and the signed-in person. */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    product,
    home,
    collapsed = false,
    search = "Search or ask",
    shortcut = "⌘K",
    onSearch,
    user,
    onUser,
    account,
    groups,
    footer,
    autoHeight = false,
    label = "Main",
    children,
    className,
  },
  ref
) {
  const Link = useLink()
  const drawer = React.useContext(drawerContext)
  const name = product ?? PRODUCT.name
  const nav = React.useRef<HTMLElement | null>(null)

  // Whether the rail is its icons-only column, from its own width, so the tooltips mount only then.
  const [narrow, setNarrow] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = nav.current
    if (!el) return
    const measure = () => setNarrow(el.clientWidth > 0 && el.clientWidth < NARROW)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const isCollapsed = !drawer && (collapsed || narrow)
  const rail = React.useMemo(() => ({ inRail: true, collapsed: isCollapsed }), [isCollapsed])

  // Command K or Control K opens search from anywhere, while typing too. The rail binds it, never its copy in the
  // phone drawer, so one press runs it once.
  const key = shortcut.replace(/[⌘⌃⌥⇧\s]/g, "").toLowerCase()
  React.useEffect(() => {
    if (!onSearch || drawer || !key) return
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== key) return
      event.preventDefault()
      onSearch()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onSearch, drawer, key])

  const setNav = useMergedRef(ref, nav)

  const searchLabel = search === false ? "" : search
  const searchButton = (
    <button
      type="button"
      onClick={onSearch}
      aria-keyshortcuts={key ? keyshortcuts(shortcut) : undefined}
      data-slot="sidebar-search"
      className={cn(
        "flex h-9 w-full min-w-0 items-center gap-2 rounded-action border border-rail-line px-3 type-body text-rail-text transition-colors duration-(--duration-fast) hover:bg-rail-hover hover:text-rail-text-strong focus-visible:outline-rail-focus pointer-coarse:h-11",
        "@max-[160px]/rail:size-10 @max-[160px]/rail:justify-center @max-[160px]/rail:px-0 @max-[160px]/rail:pointer-coarse:size-11"
      )}
    >
      <Icon name="Search" />
      <span className="min-w-0 flex-1 truncate text-left @max-[160px]/rail:sr-only">{searchLabel}</span>
      {/* The hint is a picture of the keys; aria-keyshortcuts tells a screen reader. */}
      {key ? (
        <Kbd variant="rail" aria-hidden="true" className="@max-[160px]/rail:hidden">
          {shortcut}
        </Kbd>
      ) : null}
    </button>
  )

  const person = user ? [user.name, user.role].filter(Boolean).join(", ") : ""
  const accountPart =
    account ??
    (user ? (
      onUser ? (
        isCollapsed ? (
          <Tooltip content={user.name} placement="right">
            <AccountButton user={user} detail={user.role} aria-label={`${person}, account menu`} onClick={onUser} />
          </Tooltip>
        ) : (
          <AccountButton user={user} detail={user.role} aria-label={`${person}, account menu`} onClick={onUser} />
        )
      ) : (
        <div data-slot="sidebar-user" className="flex h-12 min-w-0 items-center gap-2.5 px-3 @max-[160px]/rail:size-10 @max-[160px]/rail:justify-center @max-[160px]/rail:p-0">
          {/* The name beside it says who this is, so the avatar is not read as well. */}
          <Avatar name={user.name} src={user.src} size={32} aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col @max-[160px]/rail:sr-only">
            <span className="truncate type-label text-rail-text-strong">{user.name}</span>
            {user.role ? <span className="truncate type-meta text-rail-text">{user.role}</span> : null}
          </span>
        </div>
      )
    ) : null)

  return (
    <railContext.Provider value={rail}>
      <nav
        ref={setNav}
        aria-label={label}
        data-slot="sidebar"
        data-collapsed={isCollapsed ? "true" : undefined}
        className={cn(
          "@container/rail flex min-h-0 min-w-0 flex-col text-rail-text",
          drawer
            ? "size-full"
            : cn("rounded-lg border border-rail-line bg-rail shadow-xs", collapsed ? "w-(--rail-collapsed)" : "w-full", autoHeight ? "h-auto" : "h-full"),
          className
        )}
      >
        <div data-slot="sidebar-header" className="flex h-14 shrink-0 items-center gap-1 pr-3 pl-5 @max-[160px]/rail:justify-center @max-[160px]/rail:px-0">
          {drawer ? (
            // No tooltip: focus lands here as the drawer opens, and a tooltip would hold the drawer's first Escape.
            <ButtonBase
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              data-slot="sidebar-close"
              onClick={drawer.onClose}
              className="-ml-2 text-rail-text-strong hover:bg-rail-hover focus-visible:outline-rail-focus"
            >
              <Icon name="X" size={20} />
            </ButtonBase>
          ) : null}
          <ProductLockup product={name} href={home} height={20} className="@max-[160px]/rail:hidden" />
          {home ? (
            <Link
              href={home}
              aria-label={`${BRAND.name} ${name}`}
              className="hidden size-10 items-center justify-center rounded-control focus-visible:outline-rail-focus @max-[160px]/rail:flex"
            >
              <Logo mark="symbol" title="" />
            </Link>
          ) : (
            <span className="hidden @max-[160px]/rail:flex">
              <Logo mark="symbol" title={`${BRAND.name} ${name}`} />
            </span>
          )}
        </div>

        {onSearch && searchLabel ? (
          <div className="shrink-0 px-2 pb-2 @max-[160px]/rail:flex @max-[160px]/rail:justify-center @max-[160px]/rail:px-0">
            {isCollapsed ? (
              <Tooltip content={searchLabel} placement="right">
                {searchButton}
              </Tooltip>
            ) : (
              searchButton
            )}
          </div>
        ) : null}

        {/* The groups scroll between the top and the foot. Focus is drawn inside the items, which this clips. */}
        <div
          data-slot="sidebar-content"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2 @max-[160px]/rail:items-center @max-[160px]/rail:gap-3 @max-[160px]/rail:px-0"
        >
          {groups?.map((group, i) => <NavGroup key={`${i}-${group.label ?? ""}`} {...group} />)}
          {children}
        </div>

        {footer ? (
          <div data-slot="sidebar-footer" className="shrink-0 px-2 pt-1 pb-2 @max-[160px]/rail:flex @max-[160px]/rail:justify-center @max-[160px]/rail:px-0">
            {Array.isArray(footer) ? <NavGroup items={footer as NavItemProps[]} /> : footer}
          </div>
        ) : null}

        {accountPart ? (
          <div data-slot="sidebar-account" className="shrink-0 border-t border-rail-line p-2 @max-[160px]/rail:flex @max-[160px]/rail:justify-center">
            {accountPart}
          </div>
        ) : null}
      </nav>
    </railContext.Provider>
  )
})

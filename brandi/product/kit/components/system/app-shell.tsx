"use client"

import * as React from "react"

import { Sheet as SheetRoot, SheetContent, SheetTitle, sheetPanelClass } from "@/components/ui/sheet"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useOverlayOpener } from "./dialog"
import { PhoneTopBar } from "./phone-top-bar"

/**
 * The shell's four layouts, by its own width: the full rail from 1280px, the rail as icons from 1024px, the
 * rail as a drawer behind a top bar from 640px, and the phone layout under that.
 */
export type ShellLayout = "full" | "icons" | "drawer" | "phone"
const layoutFor = (width: number): ShellLayout => (width >= 1280 ? "full" : width >= 1024 ? "icons" : width >= 640 ? "drawer" : "phone")

interface ShellState {
  layout: ShellLayout
  /** The bar at the foot on a phone, when no tab bar has the place: PageHeader moves its primary there. */
  actionBar: HTMLElement | null
}
export const shellContext = React.createContext<ShellState | null>(null)
/** The shell around a part, or null outside one. */
export function useShell() {
  return React.useContext(shellContext)
}

/** Tells the Sidebar inside the drawer that it is there, and how to close it. */
export const drawerContext = React.createContext<{ onClose: () => void } | null>(null)

// The drawer is the Sheet from the left, on the rail's own colours, never wider than a thumb's reach.
const drawerClass = "max-w-80 overflow-hidden bg-rail text-rail-text"

export interface AppShellProps {
  /** A Sidebar. It is the rail from 1024px, and the drawer's contents under that. Built in the board's script on a canvas. */
  sidebar?: React.ReactNode
  /** The product's name, for the lockup in the top bar under 1024px. */
  product?: string
  /** Where the top bar's lockup links. */
  home?: string
  /** Controls the drawer, with onNavOpenChange. Leave both out and the menu button opens it. */
  navOpen?: boolean
  onNavOpenChange?: (open: boolean) => void
  /** Draws the drawer open in place, for a design on a canvas: a still picture with no live layer, so the board keeps its Escape key and its tab order. */
  navInline?: boolean
  /** Replaces the top bar, for a detail screen: a PhoneTopBar with Back and the screen's title. */
  topBar?: React.ReactNode
  /** A PhoneTabBar for the foot under 640px. With one, PageHeader's primary stays in the header. */
  tabBar?: React.ReactNode
  /** The main region's id: what the skip link and route focus target. One per page. */
  mainId?: string
  /** A PageHeader, then panes and cards. */
  children?: React.ReactNode
  className?: string
}

/** The frame of every product: a skip link, the canvas, the rail and the main column. */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { sidebar, product, home, navOpen, onNavOpenChange, navInline = false, topBar, tabBar, mainId = "main", children, className },
  ref
) {
  const root = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, root)

  // The look follows the shell's width through container queries, so the server and a canvas draw the
  // right layout at once. Behaviour (the live drawer, the action bar) follows this measurement. Layout
  // width, not the drawn box: a canvas may draw a board scaled.
  const [layout, setLayout] = React.useState<ShellLayout>("full")
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => {
      if (el.clientWidth > 0) setLayout(layoutFor(el.clientWidth))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  // Under 1024px the rail is a drawer behind a top bar. Under 640px the phone layout adds the bar at the foot.
  const drawered = layout === "drawer" || layout === "phone"
  const phone = layout === "phone"

  const [ownOpen, setOwnOpen] = React.useState(false)
  const open = navOpen ?? ownOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      setOwnOpen(next)
      onNavOpenChange?.(next)
    },
    [onNavOpenChange]
  )
  const live = drawered && !navInline
  const menuRef = React.useRef<HTMLButtonElement | null>(null)
  const mainRef = React.useRef<HTMLElement | null>(null)
  // Focus goes back to the menu button the moment the drawer closes, by Escape, the scrim or its close button.
  const { restoreFocus, themeProps, contentRef } = useOverlayOpener(live && open, menuRef)

  // Choosing a destination in the drawer closes it, and focus lands where a route change puts it: on main,
  // never on the menu button or the page body. This runs after the hook above has given focus back.
  const chose = React.useRef(false)
  React.useEffect(() => {
    if (open || !chose.current) return
    chose.current = false
    mainRef.current?.focus()
  }, [open])
  // The drawer belongs to the layouts under 1024px, so widening the shell past that closes it, and focus, which
  // was inside it, goes to main: the menu button that opened it goes with the top bar.
  React.useEffect(() => {
    if (drawered || !open) return
    chose.current = true
    setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawered])
  const onDrawerClick = (event: React.MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!(event.target as Element).closest?.("a[href]")) return
    chose.current = true
    setOpen(false)
  }

  const [actionBar, setActionBar] = React.useState<HTMLDivElement | null>(null)
  const hasTabBar = Boolean(tabBar)
  const state = React.useMemo<ShellState>(() => ({ layout, actionBar: phone && !hasTabBar ? actionBar : null }), [layout, phone, hasTabBar, actionBar])
  const drawer = React.useMemo(() => ({ onClose: () => setOpen(false) }), [setOpen])

  return (
    <shellContext.Provider value={state}>
      <div
        ref={merged}
        data-slot="app-shell"
        data-layout={layout}
        className={cn("@container/shell relative isolate flex h-dvh w-full min-w-0 overflow-hidden bg-canvas text-text", className)}
      >
        {/* A plain link, not the system's: the browser's own jump to #main is what moves focus there. */}
        <a
          href={`#${mainId}`}
          data-slot="skip-link"
          className="absolute top-2 left-2 z-(--z-toast) inline-flex h-10 items-center rounded-action bg-surface-raised px-4 type-label text-text-strong shadow-md not-focus-visible:sr-only"
        >
          Skip to content
        </a>

        {sidebar ? (
          <div
            data-slot="app-shell-rail"
            // Inset 8px from the screen's edges, as the sheet is. 72px of icons from 1024px, the full rail from 1280px.
            className="hidden w-[calc(var(--rail-collapsed)+0.5rem)] shrink-0 py-2 pl-2 @min-[1024px]/shell:flex @min-[1280px]/shell:w-[calc(var(--rail-width)+0.5rem)]"
          >
            {sidebar}
          </div>
        ) : null}

        {/* Drawn open for a design, the page behind the drawer is hidden, as it is from a screen reader when the
            drawer is live: the picture is the drawer and its scrim, with no words left under a layer. */}
        <div data-slot="app-shell-column" className={cn("flex min-h-0 min-w-0 flex-1 flex-col", navInline && "@max-[1024px]/shell:invisible")}>
          <div data-slot="app-shell-top" className="shrink-0 @min-[1024px]/shell:hidden">
            {topBar ?? (
              <PhoneTopBar
                product={product}
                home={home}
                onMenu={sidebar ? () => setOpen(true) : undefined}
                menuExpanded={open || navInline}
                menuRef={menuRef}
              />
            )}
          </div>
          {/* The column scrolls and the rail stays put. The bars sit outside the scroll, so neither can hide what has focus. */}
          <main
            ref={mainRef}
            id={mainId}
            tabIndex={-1}
            data-slot="app-shell-main"
            className="min-h-0 flex-1 overflow-y-auto px-8 pt-6 pb-10 focus-visible:outline-offset-[-2px] @max-[1280px]/shell:px-6 @max-[640px]/shell:px-4 @max-[640px]/shell:pt-4 @max-[640px]/shell:pb-6"
          >
            {children}
          </main>
          <div data-slot="app-shell-foot" className="shrink-0 @min-[640px]/shell:hidden">
            {tabBar ?? (
              <div
                ref={setActionBar}
                data-slot="app-shell-action-bar"
                className="flex gap-2 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] empty:hidden *:flex-1"
              />
            )}
          </div>
        </div>

        {live && sidebar ? (
          <SheetRoot open={open} onOpenChange={setOpen}>
            <SheetContent
              ref={contentRef}
              side="left"
              showCloseButton={false}
              aria-describedby={undefined}
              overlayProps={themeProps}
              data-theme={themeProps["data-theme"]}
              onCloseAutoFocus={restoreFocus}
              onClick={onDrawerClick}
              className={cn(themeProps.className, drawerClass)}
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <drawerContext.Provider value={drawer}>{sidebar}</drawerContext.Provider>
            </SheetContent>
          </SheetRoot>
        ) : null}

        {navInline && sidebar ? (
          // The open drawer as a still picture: no portal, focus trap or dismiss layer, so the board keeps its keys.
          <div data-slot="app-shell-drawer-picture" className="absolute inset-0 z-(--z-sheet) @min-[1024px]/shell:hidden">
            <div aria-hidden="true" className="absolute inset-0 bg-scrim" />
            <div
              role="dialog"
              aria-label="Navigation"
              data-slot="sheet-content"
              data-side="left"
              data-inline=""
              className={cn(sheetPanelClass, drawerClass, "absolute inset-y-2 left-2 w-[calc(100%-1rem)]")}
            >
              <drawerContext.Provider value={drawer}>{sidebar}</drawerContext.Provider>
            </div>
          </div>
        ) : null}
      </div>
    </shellContext.Provider>
  )
})

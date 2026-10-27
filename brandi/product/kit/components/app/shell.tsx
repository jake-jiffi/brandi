"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import * as React from "react"

import {
  AppShell,
  CommandMenu,
  NotificationCentre,
  PhoneTopBar,
  Sidebar,
  WorkspaceSwitcher,
  type CommandGroup,
  type NavGroupProps,
  type NavItemProps,
} from "@/components/system"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { PRODUCT } from "@/lib/product"
import { NOTIFICATIONS, PERSON, WORKSPACES } from "@/lib/sample"

import { markRead, requestNewJob, useExample } from "./example-store"

/** The product's places, as the rail and the command menu list them. Eight top-level places at most. */
const PLACES: NavItemProps[] = [
  { label: "Home", href: "/", icon: "House" },
  { label: "Jobs", href: "/jobs", icon: "ClipboardList" },
  { label: "Invoices", href: "/invoices", icon: "Receipt" },
]
const BUILD: NavItemProps[] = [{ label: "Kit", href: "/kit", icon: "LayoutGrid" }]
const FOOTER: NavItemProps[] = [
  { label: "Settings", href: "/settings", icon: "Settings" },
  { label: "Help", href: "/help", icon: "CircleHelp" },
]

const isCurrent = (href: string, path: string | null) => path !== null && (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`))

/** The notifications, read as the example's store says. */
function useNotifications() {
  const { read } = useExample()
  return React.useMemo(() => NOTIFICATIONS.map((n) => (read.includes(n.id) ? { ...n, unread: false } : n)), [read])
}

/**
 * The account menu, with the notifications beside it on the rail. In the drawer under 1024px the bell steps
 * aside, because the top bar carries it there. Hidden by a style rather than left out, so the server and the
 * browser draw the same thing whatever the width.
 */
function RailAccount() {
  const router = useRouter()
  const notifications = useNotifications()
  const [workspace, setWorkspace] = React.useState(WORKSPACES[0].value)
  return (
    <div className="flex min-w-0 items-center gap-1 @max-[160px]/rail:flex-col-reverse @max-[160px]/rail:gap-2">
      <div className="min-w-0 flex-1">
        <WorkspaceSwitcher
          user={{ name: PERSON.name, role: PERSON.role }}
          workspaces={WORKSPACES}
          value={workspace}
          onChange={setWorkspace}
          items={[
            { label: "Settings", icon: "Settings", onSelect: () => router.push("/settings") },
            { label: "Help", icon: "CircleHelp", onSelect: () => router.push("/help") },
          ]}
        />
      </div>
      <div className="flex shrink-0 in-data-[slot=sheet-content]:hidden">
        <NotificationCentre items={notifications} onRead={markRead} />
      </div>
    </div>
  )
}

/** The rail, with the page people are on marked. `path` is null while the path is unknown: nothing is current. */
function Rail({ path, onSearch }: { path: string | null; onSearch: () => void }) {
  const { jobs } = useExample()
  const needYou = jobs.filter((j) => j.status === "needs-you").length
  const groups: NavGroupProps[] = [
    { items: PLACES.map((p) => ({ ...p, current: isCurrent(p.href, path), ...(p.href === "/jobs" ? { count: needYou, attention: true } : {}) })) },
    { label: "Design system", items: BUILD.map((p) => ({ ...p, current: isCurrent(p.href, path) })) },
  ]
  return (
    <Sidebar
      product={PRODUCT.name}
      home="/"
      onSearch={onSearch}
      groups={groups}
      footer={FOOTER.map((p) => ({ ...p, current: isCurrent(p.href, path) }))}
      account={<RailAccount />}
    />
  )
}

function RailOnPath(props: { onSearch: () => void }) {
  return <Rail path={usePathname()} {...props} />
}

/**
 * The frame every page sits in: AppShell with the rail, the top bar under 1024px with the notifications,
 * the phone action bar, and the command menu on Cmd or Ctrl K. Lives in the route group's layout, so it
 * stays mounted between pages.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [shortcuts, setShortcuts] = useShortcuts()
  const { jobs } = useExample()
  const notifications = useNotifications()
  const [navOpen, setNavOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLButtonElement | null>(null)
  // Where focus goes when the command menu closes and nothing had focus as it opened (Cmd K from the page).
  const main = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    main.current = document.getElementById("main")
  }, [])

  // Cmd or Ctrl K opens it and closes it again; so does the rail's search button.
  const openCommand = React.useCallback(() => setCommandOpen((open) => !open), [])
  const go = React.useCallback(
    (href: string) => () => {
      setNavOpen(false)
      router.push(href)
    },
    [router]
  )
  const dark = resolvedTheme === "dark"
  const groups: CommandGroup[] = [
    { label: "Jump to", items: [...PLACES, ...FOOTER, ...BUILD].map((p) => ({ label: p.label, icon: p.icon, onSelect: go(p.href) })) },
    {
      label: "Jobs that need you",
      items: jobs
        .filter((j) => j.status === "needs-you")
        .map((j) => ({ label: `${j.id} ${j.customer}`, description: j.service, icon: "ClipboardList" as const, keywords: [j.service], onSelect: go(`/jobs/${j.id}`) })),
    },
    {
      label: "Actions",
      items: [
        {
          label: "New job",
          icon: "Plus",
          keywords: ["add", "create", "book"],
          onSelect: () => {
            requestNewJob()
            // On the jobs page already, the form opens over the view as it is.
            if (window.location.pathname !== "/jobs") go("/jobs")()
            else setNavOpen(false)
          },
        },
        { label: dark ? "Use the light theme" : "Use the dark theme", icon: dark ? "Sun" : "Moon", keywords: ["theme", "dark", "light"], onSelect: () => setTheme(dark ? "light" : "dark") },
        {
          label: shortcuts ? "Turn off single-key shortcuts" : "Turn on single-key shortcuts",
          icon: "Keyboard",
          keywords: ["keyboard", "shortcuts"],
          onSelect: () => setShortcuts(!shortcuts),
        },
      ],
    },
  ]

  return (
    <AppShell
      product={PRODUCT.name}
      home="/"
      navOpen={navOpen}
      onNavOpenChange={setNavOpen}
      sidebar={
        <React.Suspense fallback={<Rail path={null} onSearch={openCommand} />}>
          <RailOnPath onSearch={openCommand} />
        </React.Suspense>
      }
      topBar={
        <PhoneTopBar
          product={PRODUCT.name}
          home="/"
          onMenu={() => setNavOpen(true)}
          menuExpanded={navOpen}
          menuRef={menuRef}
          actions={<NotificationCentre items={notifications} onRead={markRead} />}
        />
      }
    >
      {children}
      <CommandMenu
        modal
        open={commandOpen}
        groups={groups}
        returnFocus={main}
        onClose={() => setCommandOpen(false)}
        onSelect={() => setNavOpen(false)}
      />
    </AppShell>
  )
}

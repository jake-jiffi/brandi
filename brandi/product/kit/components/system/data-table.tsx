"use client"

import * as React from "react"

import { Checkbox as CheckboxBox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber, NUMBER_STYLES, type NumberStyle } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import type { FeedbackAction } from "./alert"
import { Avatar } from "./avatar"
import { Badge, type BadgeTone } from "./badge"
import { cardNesting } from "./card"
import { Checkbox } from "./checkbox"
import { Delta, type DeltaGoodWhen } from "./delta"
import { EditableCell, type EditableCellSave } from "./editable-cell"
import { Icon } from "./icon"
import { IconButton } from "./icon-button"
import { List, stateView } from "./list"
import { ListRow, type ListRowBadge } from "./list-row"
import { Progress } from "./progress"
import { Skeleton } from "./skeleton"
import { Tag, type TagColor } from "./tag"
import { Toolbar } from "./toolbar"

/** A row is plain data, as an API returns it. */
export type DataTableRow = Record<string, unknown>

export type DataTableColumnType =
  | "text"
  | "strong"
  | "stack"
  | "person"
  | "badge"
  | "tags"
  | NumberStyle
  | "delta"
  | "progress"
  | "actions"

/** An action in a row's menu. It gets the row it was chosen for. */
export interface DataTableMenuAction {
  label: string
  icon?: IconName
  description?: string
  shortcut?: string
  /** Destructive: last, after a separator, in danger text. */
  danger?: boolean
  disabled?: boolean
  checked?: boolean
  onSelect?: (row: DataTableRow) => void
}

export type DataTableMenuEntry = DataTableMenuAction | "separator" | { group: string }

export interface DataTableColumn {
  /** The field in each row. */
  key: string
  /** A short head, in sentence case: it shows in capitals. */
  label: string
  /** How the value reads. Every number style is right-aligned, through the formatter, in tabular figures. */
  type?: DataTableColumnType
  sortable?: boolean
  /** Numbers and deltas sit at the end, everything else at the start. */
  align?: "start" | "end"
  /** px, or any CSS length. */
  width?: number | string
  /** Lets long text wrap. */
  wrap?: boolean
  /** Caps the column; text wraps inside the cap rather than being cut. */
  maxWidth?: number | string
  /** What a missing value says. "Not set" by default. */
  empty?: string
  /** The actions column's menu: entries, or a function of the row. */
  items?: DataTableMenuEntry[] | ((row: DataTableRow) => DataTableMenuEntry[])
  /** Draws the cell. Plain data is the default; use this for what no type covers. */
  render?: (row: DataTableRow) => React.ReactNode
  /** Where the column goes when the table becomes a list under 640px: the meta line (the default), the badge line, or nowhere. */
  phone?: "meta" | "badge" | "hidden"
  /** A delta's number style (percent by default, points for a rate), or a progress figure's. */
  format?: NumberStyle
  /** A delta's better direction. */
  goodWhen?: DeltaGoodWhen
  /** A progress column's end. 100 by default. */
  max?: number
  /** Edits in place with EditableCell; DataTable's onCellSave saves it. The naming column never is. */
  editable?: boolean
  /** Checks an edit before it saves: return what is wrong and how to fix it. */
  validate?: (value: string, row: DataTableRow) => string | null | undefined
}

export interface DataTableSort {
  key: string
  direction: "ascending" | "descending"
}

/** An action for the selected rows. It gets the keys of the selected rows on screen, and only those. */
export interface DataTableBulkAction {
  label: string
  icon?: IconName
  variant?: "secondary" | "primary" | "danger"
  disabled?: boolean
  onSelect?: (keys: string[]) => void
}

/** An empty or error state as data, so a board can pass it. */
export interface DataTableStateText {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: FeedbackAction[]
}

export interface DataTableToolbar {
  /** Names the toolbar for screen readers ("[Invoice] filters"). */
  label: string
  /** What the selected rows can have done to them. Selecting rows swaps the filters for these and the count. */
  bulkActions?: DataTableBulkAction[]
  /** Search, filter chips, a Spacer, then view controls. */
  children?: React.ReactNode
  sticky?: boolean
}

export interface DataTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  /** Names the table for screen readers: what the rows are. */
  caption: string
  /** The field that keys each row. "id" by default. */
  rowKey?: string
  /** The column that names a row. The first column by default. */
  labelKey?: string
  /** A checkbox on every row and in the head. Selecting a row never opens it. */
  selectable?: boolean
  selectedKeys?: string[]
  defaultSelected?: string[]
  onSelectionChange?: (keys: string[]) => void
  /** Sorted by the server: pass the sort and change it in onSortChange. */
  sort?: DataTableSort | null
  /** Sorted here, starting from this. */
  defaultSort?: DataTableSort
  onSortChange?: (sort: DataTableSort) => void
  /** 48px rows, or 40px. One density per table, never tighter. */
  density?: "comfortable" | "compact"
  /** The rows scroll under a head that sticks. px, or any CSS length. */
  maxHeight?: number | string
  /** Under the rows, on the subtle surface: put Pagination here. */
  footer?: React.ReactNode
  /** A Toolbar above the table, told how many rows are selected. */
  toolbar?: DataTableToolbar
  /** The head stays; the rows wait as skeletons. */
  loading?: boolean
  loadingRows?: number
  /** Replaces the rows when they could not load, keeping the head. Name the system that failed. */
  error?: React.ReactNode | DataTableStateText
  /** Adds Try again to the error. */
  onRetry?: () => void
  /** Replaces the rows when there are none, keeping the head and the toolbar. */
  empty?: React.ReactNode | DataTableStateText
  /** Opens a row: the naming cell becomes its button, so rows open from the keyboard. */
  onRowClick?: (row: DataTableRow) => void
  /** Opens a row: the naming cell becomes its link. */
  rowHref?: (row: DataTableRow) => string | undefined
  /** Saves an editable cell. Return or resolve a message when the save failed. */
  onCellSave?: (row: DataTableRow, key: string, value: string) => ReturnType<EditableCellSave>
  /** The level of an empty or error state's title. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

// -- Reading plain data, whatever shape it arrives in: some data crashed the reference's table (round 1). --

const isNumberStyle = (t: unknown): t is NumberStyle => (NUMBER_STYLES as readonly unknown[]).includes(t)
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v) && !React.isValidElement(v)
const missing = (v: unknown) => v === null || v === undefined || v === ""

function numberOf(v: unknown): number | null {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v
  return typeof n === "number" && Number.isFinite(n) ? n : null
}

/** The words a value reads as: a string, a number, or the title, name or label of an object. */
function wordsOf(v: unknown): string {
  if (missing(v)) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  if (Array.isArray(v)) return v.map(wordsOf).filter(Boolean).join(", ")
  if (isObject(v)) return wordsOf(v.title ?? v.name ?? v.label ?? "")
  return ""
}

function badgeOf(v: unknown): ListRowBadge | null {
  if (missing(v)) return null
  if (isObject(v) && typeof v.label === "string") return { label: v.label, tone: (v.tone as BadgeTone) ?? "neutral" }
  const label = wordsOf(v)
  return label ? { label, tone: "neutral" } : null
}

function tagsOf(v: unknown): Array<{ label: string; color?: TagColor }> {
  const list = Array.isArray(v) ? v : missing(v) ? [] : [v]
  return list
    .map((t) => (isObject(t) ? { label: wordsOf(t.label ?? t.name), color: t.color as TagColor | undefined } : { label: wordsOf(t) }))
    .filter((t) => t.label)
}

const typeOf = (col: DataTableColumn): DataTableColumnType => col.type ?? "text"
const alignOf = (col: DataTableColumn) => col.align ?? (isNumberStyle(typeOf(col)) || typeOf(col) === "delta" || typeOf(col) === "actions" ? "end" : "start")
const length = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v)
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

function sortValue(col: DataTableColumn, v: unknown): number | string | null {
  const type = typeOf(col)
  if (isNumberStyle(type) || type === "delta" || type === "progress") return numberOf(v)
  const words = wordsOf(v)
  return words === "" ? null : words
}

/** Missing values go last, whichever way the column is sorted. */
function compareRows(a: DataTableRow, b: DataTableRow, col: DataTableColumn, direction: DataTableSort["direction"]) {
  const x = sortValue(col, a[col.key])
  const y = sortValue(col, b[col.key])
  if (x === null && y === null) return 0
  if (x === null) return 1
  if (y === null) return -1
  const order = typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x), String(y))
  return direction === "ascending" ? order : -order
}

// -- The row menu --

type RowMenuEntry =
  | { label: string; icon?: IconName; description?: string; shortcut?: string; danger?: boolean; disabled?: boolean; checked?: boolean; onSelect?: () => void }
  | "separator"
  | { group: string }

/**
 * Stands in for Menu until it lands in the kit, with Menu's own props, so the swap is one import: an overflow
 * button named for the record, a menu in a portal that closes at once, and focus back on the button.
 */
function RowMenu({ label, items }: { label: string; items: RowMenuEntry[] }) {
  const [open, setOpen] = React.useState(false)
  const trigger = React.useRef<HTMLButtonElement | null>(null)
  const was = React.useRef(false)
  React.useEffect(() => {
    if (was.current && !open) {
      const active = document.activeElement
      if (!active || active === document.body) trigger.current?.focus()
    }
    was.current = open
  }, [open])
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton ref={trigger} icon="Ellipsis" label={label} />
      </DropdownMenuTrigger>
      {/* Mounted only while open, so closing takes it away at once and its layer never holds the next Escape. */}
      {open ? (
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="z-(--z-popover) w-auto min-w-44 rounded-md border border-line bg-surface-raised p-1 text-text shadow-lg ring-0"
        >
          {items.map((item, i) =>
            item === "separator" ? (
              <DropdownMenuSeparator key={i} className="bg-line" />
            ) : "group" in item ? (
              <DropdownMenuLabel key={i} className="px-2 py-1.5 type-eyebrow text-text-muted">
                {item.group}
              </DropdownMenuLabel>
            ) : (
              <DropdownMenuItem
                key={i}
                disabled={item.disabled}
                onSelect={() => item.onSelect?.()}
                className={cn(
                  "h-9 gap-2 rounded-sm px-2 type-body text-text focus:bg-hover focus:text-text-strong focus:shadow-[inset_0_0_0_1px_var(--line-control)] pointer-coarse:h-11",
                  item.danger && "text-danger focus:text-danger"
                )}
              >
                {item.icon ? <Icon name={item.icon} /> : null}
                {item.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  )
}

/** Binds the row into each action, so the menu's actions take no argument, as Menu's do. */
function menuFor(col: DataTableColumn, row: DataTableRow): RowMenuEntry[] {
  let entries: unknown
  try {
    entries = typeof col.items === "function" ? col.items(row) : col.items
  } catch {
    entries = []
  }
  if (!Array.isArray(entries)) return []
  return entries.flatMap((entry): RowMenuEntry[] => {
    if (entry === "separator") return ["separator"]
    if (isObject(entry) && typeof entry.group === "string") return [{ group: entry.group }]
    if (isObject(entry) && typeof entry.label === "string") {
      const action = entry as unknown as DataTableMenuAction
      return [{ ...action, onSelect: () => action.onSelect?.(row) }]
    }
    return []
  })
}

// Presses inside these never open the row: selecting a row never opens it (round 1).
const OWN_PRESS = 'a, button, input, textarea, select, label, [role="checkbox"], [role="menuitem"], [data-slot="editable-cell"], [data-slot="data-table-select"]'

/** Records in rows and columns, declared by column type, so a design and the product share one definition. */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(function DataTable(
  {
    columns,
    rows,
    caption,
    rowKey = "id",
    labelKey,
    selectable = false,
    selectedKeys,
    defaultSelected,
    onSelectionChange,
    sort,
    defaultSort,
    onSortChange,
    density = "comfortable",
    maxHeight,
    footer,
    toolbar,
    loading = false,
    loadingRows = 5,
    error,
    onRetry,
    empty,
    onRowClick,
    rowHref,
    onCellSave,
    headingLevel = 3,
    className,
    ...rest
  },
  ref
) {
  const Link = useLink()
  const nested = React.useContext(cardNesting)
  const box = !nested
  const cols = React.useMemo(() => (Array.isArray(columns) ? columns.filter((c) => isObject(c) && typeof c.key === "string") : []), [columns])
  const safeRows = React.useMemo(() => (Array.isArray(rows) ? rows.filter(isObject) : []), [rows])
  // The naming column holds each row's link or button, so a labelKey that names no column falls back to the
  // first, and every row can still be opened.
  const nameKey = (labelKey && cols.some((c) => c.key === labelKey) ? labelKey : cols.find((c) => typeOf(c) !== "actions")?.key) ?? ""
  const keyOf = React.useCallback((row: DataTableRow, index: number) => (missing(row[rowKey]) ? String(index) : String(row[rowKey])), [rowKey])
  const openable = Boolean(onRowClick || rowHref)

  // -- Sorting: here from defaultSort, or by the server through sort and onSortChange. --
  const [ownSort, setOwnSort] = React.useState<DataTableSort | null>(defaultSort ?? null)
  const given = sort !== undefined ? sort : ownSort
  const givenKey = given && typeof given.key === "string" ? given.key : null
  const givenDirection = given?.direction === "descending" ? "descending" : "ascending"
  const current = React.useMemo<DataTableSort | null>(() => (givenKey ? { key: givenKey, direction: givenDirection } : null), [givenKey, givenDirection])
  const [spoken, setSpoken] = React.useState("")
  const shown = React.useMemo(() => {
    // A row with nothing in its naming column is named by its key, so a menu or a checkbox still says which row.
    const list = safeRows.map((row, index) => {
      const key = keyOf(row, index)
      return { row, key, name: wordsOf(row[nameKey]) || key }
    })
    const col = current ? cols.find((c) => c.key === current.key) : undefined
    // Server-sorted rows arrive in order; rows sorted here keep their order among equals.
    if (sort === undefined && col && current) list.sort((a, b) => compareRows(a.row, b.row, col, current.direction))
    return list
  }, [safeRows, current, sort, cols, keyOf, nameKey])
  const pressSort = (col: DataTableColumn) => {
    const next: DataTableSort =
      current?.key === col.key
        ? { key: col.key, direction: current.direction === "ascending" ? "descending" : "ascending" }
        : { key: col.key, direction: "ascending" }
    if (sort === undefined) setOwnSort(next)
    onSortChange?.(next)
    setSpoken(`Sorted by ${lowerFirst(col.label)}, ${next.direction}`)
  }

  // -- Selection, of rows on screen only: bulk actions acted on rows that were not on screen (round 3). --
  const [ownSelected, setOwnSelected] = React.useState<string[]>(Array.isArray(defaultSelected) ? defaultSelected.map(String) : [])
  const selected = Array.isArray(selectedKeys) ? selectedKeys.map(String) : ownSelected
  const keys = shown.map((s) => s.key)
  const onScreen = new Set(keys)
  const chosen = keys.filter((k) => selected.includes(k))
  const setSelected = (next: string[]) => {
    const ordered = keys.filter((k) => next.includes(k))
    if (!Array.isArray(selectedKeys)) setOwnSelected(ordered)
    onSelectionChange?.(ordered)
  }
  // Rows that leave the screen leave the selection.
  React.useEffect(() => {
    if (selected.some((k) => !onScreen.has(k))) setSelected(chosen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join("\u0000")])
  // Shift with a press or with Space selects the run from the last row pressed.
  const anchor = React.useRef<string | null>(null)
  const shift = React.useRef(false)
  const toggle = (key: string, on: boolean) => {
    const range = shift.current && anchor.current !== null && anchor.current !== key && onScreen.has(anchor.current)
    shift.current = false
    let next: string[]
    if (range) {
      const a = keys.indexOf(anchor.current as string)
      const b = keys.indexOf(key)
      const run = keys.slice(Math.min(a, b), Math.max(a, b) + 1)
      next = on ? [...chosen, ...run] : chosen.filter((k) => !run.includes(k))
      // A shift press also selects text between the two rows; take that away.
      window.getSelection()?.removeAllRanges()
    } else {
      next = on ? [...chosen, key] : chosen.filter((k) => k !== key)
    }
    anchor.current = key
    setSelected(next)
  }
  const allOn = keys.length > 0 && chosen.length === keys.length
  const someOn = chosen.length > 0 && !allOn
  const selectAll = () => setSelected(allOn ? [] : keys)
  const rowBox = (key: string, name: string) => (
    <CheckboxBox
      checked={chosen.includes(key)}
      onCheckedChange={(next) => toggle(key, next === true)}
      onPointerDown={(event) => { shift.current = event.shiftKey }}
      onKeyDown={(event) => { if (event.key === " ") shift.current = event.shiftKey }}
      aria-label={`Select ${name}`}
    />
  )

  // -- The scroll box: a named region that takes focus when the table is wider or taller than its box. --
  const scroller = React.useRef<HTMLDivElement | null>(null)
  const [scrolls, setScrolls] = React.useState({ x: false, y: false })
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () => {
      const x = el.scrollWidth > el.clientWidth + 1
      const y = el.scrollHeight > el.clientHeight + 1
      setScrolls((s) => (s.x === x && s.y === y ? s : { x, y }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])
  const scrollable = scrolls.x || scrolls.y

  // -- States: the head and the toolbar stay; the rows give way. --
  const view = loading ? "loading" : !missing(error) && error !== false ? "error" : shown.length ? "rows" : "empty"
  const emptyNode =
    view === "empty" ? stateView(empty as React.ReactNode | DataTableStateText, { kind: "empty", headingLevel, fallback: `No ${lowerFirst(caption)} yet.` }) : null
  const errorNode =
    view === "error" ? stateView(error as React.ReactNode | DataTableStateText, { kind: "error", headingLevel, onRetry, fallback: "These rows could not load." }) : null

  // -- Cells --
  const openClass = "rounded-xs text-left type-label text-text-strong underline-offset-4 hover:underline"
  const opener = (row: DataTableRow, content: React.ReactNode) => {
    const href = rowHref?.(row)
    if (href) {
      return (
        <Link href={href} data-slot="data-table-open" className={openClass}>
          {content}
        </Link>
      )
    }
    if (onRowClick) {
      return (
        <button type="button" data-slot="data-table-open" onClick={() => onRowClick(row)} className={openClass}>
          {content}
        </button>
      )
    }
    return content
  }

  const cellContent = (col: DataTableColumn, row: DataTableRow, name: string): React.ReactNode => {
    const type = typeOf(col)
    const value = row[col.key]
    const naming = col.key === nameKey
    const none = <span className="text-text-subtle">{col.empty ?? "Not set"}</span>

    if (col.render) {
      let drawn: React.ReactNode = null
      try {
        drawn = col.render(row)
      } catch {
        drawn = null
      }
      return naming && (typeof drawn === "string" || typeof drawn === "number") ? opener(row, drawn) : drawn ?? none
    }
    if (type === "actions") return <RowMenu label={`More actions for ${name}`} items={menuFor(col, row)} />
    // The naming column holds the row's link or button and names the record, so it is never edited in place.
    if (col.editable && !naming) {
      return (
        <EditableCell
          value={numberOf(value) ?? (missing(value) ? null : wordsOf(value))}
          label={`${col.label} for ${name}`}
          format={isNumberStyle(type) ? type : undefined}
          empty={col.empty}
          align={alignOf(col)}
          validate={col.validate ? (v) => col.validate?.(v, row) : undefined}
          onSave={onCellSave ? (v) => onCellSave(row, col.key, v) : undefined}
        />
      )
    }
    if (isNumberStyle(type)) {
      const figure = formatNumber(numberOf(value), type)
      return figure ? (naming ? opener(row, figure) : figure) : none
    }
    switch (type) {
      case "delta":
        return numberOf(value) === null ? none : <Delta value={numberOf(value)} format={col.format ?? "percent"} goodWhen={col.goodWhen} />
      case "progress": {
        const n = numberOf(value)
        if (n === null) return none
        const end = col.max && col.max > 0 ? col.max : 100
        const words = end === 100 ? formatNumber(n, "percent", { digits: 0 }) : `${formatNumber(n, col.format ?? "number")} of ${formatNumber(end, col.format ?? "number")}`
        return <Progress label={words} value={n} max={end} size="sm" className="w-32" />
      }
      case "badge": {
        const b = badgeOf(value)
        return b ? <Badge tone={b.tone ?? "neutral"}>{b.label}</Badge> : none
      }
      case "tags": {
        const list = tagsOf(value)
        return list.length ? (
          <span className="flex flex-wrap gap-1.5">
            {list.map((t, i) => (
              <Tag key={`${t.label}-${i}`} color={t.color}>
                {t.label}
              </Tag>
            ))}
          </span>
        ) : (
          none
        )
      }
      case "person": {
        const who = isObject(value) ? { name: wordsOf(value.name), src: typeof value.src === "string" ? value.src : undefined } : { name: wordsOf(value) }
        if (!who.name) return none
        return (
          <span className="flex items-center gap-2.5">
            {/* The name is beside it, so the picture is not read as well. */}
            <Avatar name={who.name} src={who.src} size={28} aria-hidden="true" />
            {naming ? opener(row, who.name) : <span className="text-text">{who.name}</span>}
          </span>
        )
      }
      case "stack": {
        const title = isObject(value) ? wordsOf(value.title) : wordsOf(value)
        const sub = isObject(value) ? wordsOf(value.sub) : ""
        if (!title) return none
        return (
          <span className="flex flex-col py-1.5">
            {naming ? opener(row, title) : <span className="type-label text-text-strong">{title}</span>}
            {sub ? <span className="type-meta text-text-subtle">{sub}</span> : null}
          </span>
        )
      }
      case "strong": {
        const words = wordsOf(value)
        return words ? naming ? opener(row, words) : <span className="type-label text-text-strong">{words}</span> : none
      }
      default: {
        const words = wordsOf(value)
        return words ? (naming ? opener(row, words) : words) : none
      }
    }
  }

  /** What a column reads as on the phone list's meta line: short, and nothing for a missing value. */
  const phoneWords = (col: DataTableColumn, row: DataTableRow): string => {
    const type = typeOf(col)
    const value = row[col.key]
    if (isNumberStyle(type)) return formatNumber(numberOf(value), type)
    if (type === "delta") {
      const n = numberOf(value)
      return n === null ? "" : `${n > 0 ? "+" : ""}${formatNumber(n, col.format ?? "percent")}`
    }
    if (type === "progress") {
      const n = numberOf(value)
      return n === null ? "" : formatNumber((n / (col.max && col.max > 0 ? col.max : 100)) * 100, "percent", { digits: 0 })
    }
    if (type === "stack") return isObject(value) ? wordsOf(value.title) : wordsOf(value)
    if (type === "badge") return badgeOf(value)?.label ?? ""
    return wordsOf(value)
  }

  const phone = {
    meta: cols.filter((c) => c.key !== nameKey && typeOf(c) !== "actions" && (c.phone ?? (typeOf(c) === "badge" ? "badge" : "meta")) === "meta"),
    badge: cols.filter((c) => c.key !== nameKey && typeOf(c) !== "actions" && (c.phone ?? (typeOf(c) === "badge" ? "badge" : "meta")) === "badge"),
    actions: cols.find((c) => typeOf(c) === "actions" && c.phone !== "hidden"),
  }

  const rowHeight = density === "compact" ? "h-(--row-compact)" : undefined
  // Inside a card, the first and last cells line up with the card's own 24px inset.
  const edge = nested ? "first:pl-6 last:pr-6" : undefined
  const colCount = cols.length + (selectable ? 1 : 0)

  // An editable column says so in its head, with a pencil, so its cells can be found without hovering.
  const headLabel = (col: DataTableColumn) =>
    col.editable ? (
      <>
        {col.label}
        <Icon name="Pencil" size={12} className="text-text-subtle" />
      </>
    ) : (
      col.label
    )

  const onRowPress = (event: React.MouseEvent<HTMLElement>) => {
    if (!openable) return
    const target = event.target as HTMLElement
    if (target.closest(OWN_PRESS)) return
    // Someone selecting text in a row is reading it, not opening it.
    if (window.getSelection()?.toString()) return
    event.currentTarget.querySelector<HTMLElement>('[data-slot="data-table-open"]')?.click()
  }

  const table = (
    <Table
      data-density={density}
      aria-busy={view === "loading" || undefined}
      containerRef={scroller}
      containerProps={{
        role: scrollable ? "region" : undefined,
        "aria-label": scrollable ? caption : undefined,
        tabIndex: scrollable ? 0 : undefined,
        "data-scrolls": scrollable ? (scrolls.x ? "x" : "y") : undefined,
        // The head is 40px: scrolling to a focused row leaves it clear of the head, so sticking never hides focus.
        className: cn("overflow-auto scroll-pt-10 focus-visible:outline-offset-[-2px]", box && "rounded-t-[calc(var(--radius-md)-1px)]", box && !footer && "rounded-b-[calc(var(--radius-md)-1px)]"),
        style: maxHeight !== undefined ? { maxHeight: length(maxHeight) } : undefined,
      } as React.HTMLAttributes<HTMLDivElement>}
    >
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="h-10 hover:[--row-wash:transparent]">
          {selectable ? (
            <TableHead data-slot="data-table-select" className={cn("sticky top-0 z-[2] w-12 pr-0", edge)}>
              <span className="flex items-center">
                <CheckboxBox
                  checked={allOn ? true : someOn ? "indeterminate" : false}
                  onCheckedChange={selectAll}
                  disabled={view !== "rows"}
                  aria-label="Select all rows shown"
                />
              </span>
            </TableHead>
          ) : null}
          {cols.map((col) => {
            const type = typeOf(col)
            const end = alignOf(col) === "end"
            const sorted = current?.key === col.key ? current.direction : undefined
            const sticky = type === "actions"
            return (
              <TableHead
                key={col.key}
                scope="col"
                aria-sort={sorted}
                data-slot="data-table-head"
                style={{ width: length(col.width), maxWidth: length(col.maxWidth) }}
                className={cn(
                  "sticky top-0 z-[2]",
                  edge,
                  end && "text-right",
                  sorted && "text-text-strong",
                  sticky && "right-0 z-[3]",
                  sticky && scrolls.x && "border-l"
                )}
              >
                {sticky ? (
                  <span className="sr-only">{col.label}</span>
                ) : col.sortable ? (
                  <button
                    type="button"
                    data-slot="data-table-sort"
                    onClick={() => pressSort(col)}
                    className={cn(
                      // Top-aligned, so a head whose icon leads still sits on the same line as the plain heads.
                      "-mx-1 inline-flex items-center gap-1 rounded-xs px-1 align-top uppercase hover:text-text-strong focus-visible:outline-offset-0",
                      end && "flex-row-reverse"
                    )}
                  >
                    {headLabel(col)}
                    <Icon
                      name={sorted === "ascending" ? "ArrowUp" : sorted === "descending" ? "ArrowDown" : "ChevronsUpDown"}
                      size={12}
                      strokeWidth={2.5}
                      className={sorted ? "text-text-strong" : "text-text-subtle"}
                    />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 align-top">{headLabel(col)}</span>
                )}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {view === "loading"
          ? Array.from({ length: Math.max(1, Math.min(25, Math.floor(Number(loadingRows)) || 5)) }, (_, i) => (
              <TableRow key={`loading-${i}`} aria-hidden="true" data-slot="data-table-skeleton-row" className={cn(rowHeight, "hover:[--row-wash:transparent]")}>
                {selectable ? (
                  <TableCell className={cn("pr-0", edge)}>
                    <Skeleton width={18} height={18} />
                  </TableCell>
                ) : null}
                {cols.map((col, j) => {
                  const end = alignOf(col) === "end"
                  const widths = end ? [56, 72, 48, 64] : [128, 96, 112, 80]
                  return (
                    <TableCell key={col.key} className={edge}>
                      <Skeleton height={12} width={typeOf(col) === "actions" ? 20 : widths[(i + j) % widths.length]} className={end ? "items-end" : undefined} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          : view === "rows"
            ? shown.map(({ row, key, name }) => {
                const on = chosen.includes(key)
                return (
                  <TableRow
                    key={key}
                    data-state={on ? "selected" : undefined}
                    data-key={key}
                    onClick={onRowPress}
                    className={cn(rowHeight, openable && "cursor-pointer")}
                  >
                    {selectable ? (
                      <TableCell
                        data-slot="data-table-select"
                        className={cn("w-12 pr-0", edge)}
                        onPointerDown={(event) => { shift.current = event.shiftKey }}
                        // The whole cell is the checkbox's target, so a press beside the box never opens the row.
                        onClick={(event) => {
                          if ((event.target as HTMLElement).closest('[role="checkbox"]')) return
                          event.currentTarget.querySelector<HTMLElement>('[role="checkbox"]')?.click()
                        }}
                      >
                        <span className="flex items-center">{rowBox(key, name)}</span>
                      </TableCell>
                    ) : null}
                    {cols.map((col) => {
                      const type = typeOf(col)
                      const end = alignOf(col) === "end"
                      const sticky = type === "actions"
                      return (
                        <TableCell
                          key={col.key}
                          data-slot="data-table-cell"
                          data-type={type}
                          style={col.maxWidth !== undefined ? { maxWidth: length(col.maxWidth) } : undefined}
                          className={cn(
                            edge,
                            end && "text-right",
                            (col.wrap || col.maxWidth !== undefined) && "whitespace-normal",
                            col.wrap && col.maxWidth === undefined && "min-w-48",
                            // The actions column sticks to the right edge while a wide table scrolls, on the row's own wash.
                            sticky && "sticky right-0 bg-surface bg-linear-to-r from-(--row-wash) to-(--row-wash) py-0 pr-2",
                            sticky && scrolls.x && "border-l"
                          )}
                        >
                          {cellContent(col, row, name)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            : (
              <TableRow data-slot="data-table-state" className="h-auto hover:[--row-wash:transparent]">
                <TableCell colSpan={colCount} className="p-0 whitespace-normal first:pl-0 last:pr-0">
                  {view === "error" ? errorNode : emptyNode}
                </TableCell>
              </TableRow>
            )}
      </TableBody>
    </Table>
  )

  const list = (
    <>
      {selectable && view === "rows" ? (
        <div data-slot="data-table-select-all" className={cn("border-b border-line py-2", nested ? "px-6" : "px-4")}>
          <Checkbox label="Select all" checked={allOn} indeterminate={someOn} onChange={selectAll} />
        </div>
      ) : null}
      <List
        boxed={false}
        loading={view === "loading"}
        error={errorNode}
        empty={emptyNode}
        headingLevel={headingLevel}
        // The rows' washes round to the box's corners where they meet them, so nothing needs clipping.
        className={cn(
          box && !selectable && "[&>li:first-child]:rounded-t-[calc(var(--radius-md)-1px)]",
          box && !footer && "[&>li:last-child]:rounded-b-[calc(var(--radius-md)-1px)]"
        )}
      >
        {view === "rows"
          ? shown.map(({ row, key, name }) => {
              const words = phone.meta.map((col) => phoneWords(col, row)).filter(Boolean)
              const badges = phone.badge.map((col) => badgeOf(row[col.key])).filter((b): b is ListRowBadge => b !== null)
              return (
                <ListRow
                  key={key}
                  data-key={key}
                  title={name}
                  meta={words.length ? words.join(" · ") : undefined}
                  badges={badges.length ? badges : undefined}
                  leading={selectable ? rowBox(key, name) : undefined}
                  action={phone.actions ? <RowMenu label={`More actions for ${name}`} items={menuFor(phone.actions, row)} /> : undefined}
                  href={rowHref?.(row)}
                  onClick={!rowHref && onRowClick ? () => onRowClick(row) : undefined}
                  className={chosen.includes(key) ? "bg-selected hover:bg-selected-strong" : undefined}
                />
              )
            })
          : null}
      </List>
    </>
  )

  return (
    <div ref={ref} data-slot="data-table" data-state={view} className={cn("@container flex min-w-0 flex-col", className)} {...rest}>
      {toolbar ? (
        <Toolbar
          label={toolbar.label}
          sticky={toolbar.sticky}
          className={nested ? "bg-surface" : undefined}
          selectedCount={chosen.length}
          bulkActions={(toolbar.bulkActions ?? []).map((action) => ({
            label: action.label,
            icon: action.icon,
            variant: action.variant,
            disabled: action.disabled,
            onSelect: () => action.onSelect?.(chosen),
          }))}
          onClearSelection={() => setSelected([])}
        >
          {toolbar.children}
        </Toolbar>
      ) : null}
      <div data-slot="data-table-box" data-boxed={box || undefined} className={cn("min-w-0", box && "rounded-md border border-line bg-surface")}>
        {/* Under 640px of its own width the same rows show as a list: no table scrolls a phone sideways (round 4). */}
        <div data-slot="data-table-wide" className="@max-[639px]:hidden">
          {table}
        </div>
        <div data-slot="data-table-list" className="hidden @max-[639px]:block">
          {list}
        </div>
        {footer ? (
          <div
            data-slot="data-table-footer"
            className={cn("border-t border-line bg-surface-subtle py-2.5", nested ? "px-6" : "px-4", box && "rounded-b-[calc(var(--radius-md)-1px)]")}
          >
            {footer}
          </div>
        ) : null}
      </div>
      {/* Polite, and only on change: a new sort is read out, never the one the table loads with. */}
      <p data-slot="data-table-status" role="status" className="sr-only">
        {view === "loading" ? `Loading ${lowerFirst(caption)}` : spoken}
      </p>
    </div>
  )
})

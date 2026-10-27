"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/format"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Avatar } from "./avatar"
import { Badge, type BadgeTone } from "./badge"
import { Icon } from "./icon"
import { IconButton } from "./icon-button"
import { Menu, type MenuEntry } from "./menu"

export interface BoardColumn {
  id: string
  /** The stage, in a word or two: "Quoted". */
  title: string
  /** Its cards wait on the reader: the count takes the highlight and is read as "3 need you". */
  attention?: boolean
}

export interface BoardCard {
  id: string
  /** The id of the column it sits in. */
  column: string
  /** Names the record, in bold. */
  title: string
  /** What it is and what is next: "[Harbour Physio], quote due Fri". */
  meta?: string
  /** One state, as a Badge on a line of its own, so it is never squeezed. */
  badge?: { label: string; tone?: BadgeTone }
  /** The person on it, by name. */
  person?: string
  /** Opens the record. Without it, `onOpen` makes the title a button. */
  href?: string
}

export interface BoardMove {
  id: string
  /** The column it moved to. */
  column: string
  /** Its place in that column, counted from 0. */
  index: number
}

export interface BoardProps {
  /** The stages, in order. */
  columns: BoardColumn[]
  /** The records. Their order in the list is their order in each column. */
  cards: BoardCard[]
  /** Names the board for screen readers: "Jobs by stage". */
  label: string
  /** Called after a card moves, by its menu, the keyboard or a drag. */
  onMove?: (move: BoardMove) => void
  /** Opens a card that has no href. */
  onOpen?: (id: string) => void
  /** What a count is read as, one and many: ["job", "jobs"]. Items by default. */
  noun?: [string, string]
  /** Skeleton cards in each column, said once as Loading. */
  loading?: boolean
  /** The cards could not load: say which system failed. Cards given stay, as the last good copy. */
  error?: React.ReactNode
  /** What an empty column says. */
  empty?: React.ReactNode
  className?: string
}

type Order = Record<string, string[]>
type Target = { column: string; index: number }

/** Each column's card ids, in order. A card naming no known column goes in the first; a repeated id counts once. */
function group(columns: BoardColumn[], cards: BoardCard[]): Order {
  const order: Order = Object.fromEntries(columns.map((c) => [c.id, [] as string[]]))
  const seen = new Set<string>()
  for (const card of cards) {
    if (seen.has(card.id)) continue
    seen.add(card.id)
    ;(order[card.column] ?? order[columns[0]?.id ?? ""])?.push(card.id)
  }
  return order
}

/** A string a screen reader hears again when it repeats: a live region skips text that has not changed. */
function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const turn = React.useRef(false)
  const say = React.useCallback((text: string) => {
    turn.current = !turn.current
    setMessage(turn.current ? text : `${text} `)
  }, [])
  return [message, say] as const
}

/** The token's duration in ms, read from the theme, so the move keeps the system's pace. */
function duration(name: string, fallback: number) {
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
  return Number.isFinite(ms) ? ms : fallback
}

const DRAG_START_PX = 4
const EDGE_PX = 48
// A card let go this far outside the board goes back where it was, rather than into the nearest column.
const OUTSIDE_PX = 32

/**
 * Records in columns by stage, for work that moves through steps. A card moves by its Move menu (the
 * keyboard and single-pointer path), or by dragging, and every move is announced.
 */
export const Board = React.forwardRef<HTMLDivElement, BoardProps>(function Board(
  { columns, cards, label, onMove, onOpen, noun, loading = false, error, empty = "Nothing here yet", className },
  ref
) {
  const Link = useLink() as React.ElementType
  const ids = React.useId()
  const [one, many] = Array.isArray(noun) && noun.length === 2 ? noun : ["item", "items"]
  const list = React.useMemo(() => (Array.isArray(cards) ? cards : []), [cards])
  const stages = Array.isArray(columns) ? columns : []
  const byId = React.useMemo(() => new Map(list.map((c) => [c.id, c])), [list])

  // The board keeps its own order, so a move shows at once on a canvas too. New data from the page
  // (a different set of cards or places) replaces it; the same data in a fresh array does not.
  const shape = `${stages.map((c) => c.id).join(",")}|${list.map((c) => `${c.id}:${c.column}`).join(",")}`
  const [state, setState] = React.useState(() => ({ shape, order: group(stages, list) }))
  if (state.shape !== shape) setState({ shape, order: group(stages, list) })
  const order = state.order
  const orderRef = React.useRef(order)
  orderRef.current = order

  const [message, say] = useAnnouncer()
  const [moved, setMoved] = React.useState<string | null>(null)
  const [drag, setDrag] = React.useState<{ id: string; target: Target } | null>(null)

  const root = React.useRef<HTMLDivElement | null>(null)
  const scroller = React.useRef<HTMLDivElement | null>(null)
  const cardEls = React.useRef(new Map<string, HTMLLIElement>())
  const triggers = React.useRef(new Map<string, HTMLButtonElement>())
  const flipFrom = React.useRef<{ id: string; rect: DOMRect } | null>(null)
  const refocus = React.useRef<{ id: string; on: "move" | "link" } | null>(null)
  const swallowClick = React.useRef(false)
  const movedTimer = React.useRef<number | undefined>(undefined)
  // A drag in progress, so it can be let go if the board leaves the page mid-drag.
  const endDrag = React.useRef<(() => void) | null>(null)

  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  React.useEffect(
    () => () => {
      window.clearTimeout(movedTimer.current)
      endDrag.current?.()
    },
    []
  )

  const columnOf = (id: string, from: Order = orderRef.current) => Object.keys(from).find((col) => from[col].includes(id))
  const titleOf = (col: string) => stages.find((c) => c.id === col)?.title ?? col

  const commit = (id: string, target: Target, how: "menu" | "drag", fromRect?: DOMRect) => {
    const current = orderRef.current
    const from = columnOf(id, current)
    if (!from || !(target.column in current)) return
    const next: Order = Object.fromEntries(Object.entries(current).map(([col, list]) => [col, list.filter((x) => x !== id)]))
    const index = Math.max(0, Math.min(target.index, next[target.column].length))
    next[target.column].splice(index, 0, id)
    const el = cardEls.current.get(id)
    flipFrom.current = { id, rect: fromRect ?? el?.getBoundingClientRect() ?? new DOMRect() }
    // Focus stays on the card in its new place: on its Move button after a menu move, and on whatever
    // in the card had it before a drag.
    const active = document.activeElement
    if (how === "menu") refocus.current = { id, on: "move" }
    else if (el && active && el.contains(active)) refocus.current = { id, on: triggers.current.get(id) === active ? "move" : "link" }
    setState((s) => ({ ...s, order: next }))
    const title = byId.get(id)?.title ?? id
    say(
      from === target.column
        ? `Moved ${title} to ${index + 1} of ${next[target.column].length} in ${titleOf(target.column)}.`
        : `Moved ${title} to ${titleOf(target.column)}.`
    )
    setMoved(id)
    window.clearTimeout(movedTimer.current)
    movedTimer.current = window.setTimeout(() => setMoved(null), 1600)
    onMove?.({ id, column: target.column, index })
  }

  // The moved card travels from where it was to where it landed, unless motion is reduced: then it
  // simply appears in its new place.
  React.useLayoutEffect(() => {
    const from = flipFrom.current
    flipFrom.current = null
    if (!from) return
    const el = cardEls.current.get(from.id)
    if (!el || typeof el.animate !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const now = el.getBoundingClientRect()
    const dx = from.rect.left - now.left
    const dy = from.rect.top - now.top
    if (!dx && !dy) return
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
      duration: duration("--duration-slow", 260),
      easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-standard").trim() || "ease-out",
    })
  }, [order])

  // A passive effect, so it runs after the menu that held focus has let go of it.
  React.useEffect(() => {
    const want = refocus.current
    refocus.current = null
    if (!want) return
    const target = want.on === "move" ? triggers.current.get(want.id) : cardEls.current.get(want.id)?.querySelector<HTMLElement>("[data-slot=board-card-link]")
    ;(target ?? triggers.current.get(want.id))?.focus()
  }, [order])

  /** The column under a point, by its horizontal extent, and the place among its cards. None far outside the board. */
  const hitTest = (x: number, y: number, dragged: string): Target | null => {
    const area = scroller.current?.getBoundingClientRect()
    if (!area || x < area.left - OUTSIDE_PX || x > area.right + OUTSIDE_PX || y < area.top - OUTSIDE_PX || y > area.bottom + OUTSIDE_PX) return null
    const cols = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-slot=board-column]") ?? [])
    let best: HTMLElement | null = null
    let bestDistance = Infinity
    for (const col of cols) {
      const r = col.getBoundingClientRect()
      const distance = x < r.left ? r.left - x : x > r.right ? x - r.right : 0
      if (distance < bestDistance) {
        best = col
        bestDistance = distance
      }
    }
    const column = best?.dataset.column
    if (!best || !column) return null
    const others = Array.from(best.querySelectorAll<HTMLElement>("[data-slot=board-card]")).filter((c) => c.dataset.card !== dragged)
    const index = others.filter((c) => {
      const r = c.getBoundingClientRect()
      return y > r.top + r.height / 2
    }).length
    return { column, index }
  }

  const startDrag = (event: React.PointerEvent<HTMLLIElement>, id: string) => {
    // A new press starts clean, whatever a cancelled drag left behind.
    swallowClick.current = false
    if (loading || event.button !== 0 || !event.isPrimary) return
    const hit = event.target as HTMLElement
    if (hit.closest("[data-board-no-drag]")) return
    const handle = Boolean(hit.closest("[data-slot=board-card-handle]"))
    // On a touch screen only the handle drags, so a swipe on a card still scrolls the page.
    if (event.pointerType === "touch" && !handle) return
    // No text selection and no native link drag while a card might be moving. A click still clicks.
    event.preventDefault()
    const el = event.currentTarget
    const from = columnOf(id)
    if (!from) return
    const origin = { column: from, index: orderRef.current[from].indexOf(id) }
    const d = { id, el, pointerId: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, scrolled: 0, active: false, target: origin, frame: 0 }

    const place = () => {
      el.style.transform = `translate(${d.lastX - d.x + d.scrolled}px, ${d.lastY - d.y}px)`
      // Far outside the board, the target is where it came from, so letting go there changes nothing.
      const target = hitTest(d.lastX, d.lastY, id) ?? origin
      if (target.column !== d.target.column || target.index !== d.target.index) {
        d.target = target
        setDrag({ id, target })
      }
    }
    // Near the board's left or right edge, it scrolls, so a far column is in reach.
    const edgeScroll = () => {
      const box = scroller.current
      if (!box || !d.active) return
      const r = box.getBoundingClientRect()
      const step = d.lastX < r.left + EDGE_PX ? -Math.ceil((r.left + EDGE_PX - d.lastX) / 4) : d.lastX > r.right - EDGE_PX ? Math.ceil((d.lastX - (r.right - EDGE_PX)) / 4) : 0
      if (step) {
        const before = box.scrollLeft
        box.scrollLeft = before + step
        d.scrolled += box.scrollLeft - before
        if (box.scrollLeft !== before) place()
      }
      d.frame = window.requestAnimationFrame(edgeScroll)
    }
    const finish = () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onCancel)
      window.removeEventListener("keydown", onKeyDown, true)
      window.cancelAnimationFrame(d.frame)
      endDrag.current = null
    }
    // The press that ends a drag never opens the card: the click it makes is swallowed. After Escape the
    // pointer is still down, so the swallowing lasts until it is let go.
    const settle = (rect: DOMRect, stillDown = false) => {
      el.style.transform = ""
      setDrag(null)
      if (!d.active) return
      swallowClick.current = true
      const release = () =>
        window.setTimeout(() => {
          swallowClick.current = false
        }, 0)
      if (stillDown) window.addEventListener("pointerup", release, { once: true, capture: true })
      else release()
      const same = d.target.column === origin.column && d.target.index === origin.index
      if (same) {
        flipFrom.current = null
        if (typeof el.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          const now = el.getBoundingClientRect()
          el.animate([{ transform: `translate(${rect.left - now.left}px, ${rect.top - now.top}px)` }, { transform: "translate(0, 0)" }], {
            duration: duration("--duration-base", 180),
            easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-standard").trim() || "ease-out",
          })
        }
        return
      }
      commit(id, d.target, "drag", rect)
    }
    function onPointerMove(e: PointerEvent) {
      if (e.pointerId !== d.pointerId) return
      d.lastX = e.clientX
      d.lastY = e.clientY
      if (!d.active) {
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_START_PX) return
        d.active = true
        window.getSelection()?.removeAllRanges()
        setDrag({ id, target: origin })
        d.frame = window.requestAnimationFrame(edgeScroll)
      }
      place()
    }
    function onPointerUp(e: PointerEvent) {
      if (e.pointerId !== d.pointerId) return
      finish()
      settle(el.getBoundingClientRect())
    }
    function onCancel(e: PointerEvent) {
      if (e.pointerId !== d.pointerId) return
      finish()
      d.target = origin
      settle(el.getBoundingClientRect())
    }
    // Escape puts the card back where it was.
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || !d.active) return
      e.preventDefault()
      e.stopPropagation()
      finish()
      d.target = origin
      settle(el.getBoundingClientRect(), true)
    }
    endDrag.current?.()
    endDrag.current = () => {
      finish()
      el.style.transform = ""
    }
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onCancel)
    window.addEventListener("keydown", onKeyDown, true)
  }

  const counted = (n: number, attention?: boolean) =>
    attention ? `${formatNumber(n)} ${n === 1 ? "needs" : "need"} you` : `${formatNumber(n)} ${n === 1 ? one : many}`
  // With no cards because they failed to load, a column is not empty: it is unknown, so it says nothing.
  const failed = error != null && !byId.size

  return (
    <div
      ref={setRoot}
      data-slot="board"
      aria-busy={loading || undefined}
      className={cn("@container flex min-w-0 flex-col gap-3", drag && "select-none", className)}
    >
      {error != null && !loading ? (
        <p data-slot="board-error" className="flex items-start gap-2 type-body text-text">
          <span className="flex h-5 items-center text-danger">
            <Icon name="CircleAlert" />
          </span>
          <span>{error}</span>
        </p>
      ) : null}
      {loading ? (
        <span role="status" className="sr-only">
          Loading {label}
        </span>
      ) : null}
      <div
        ref={scroller}
        role="group"
        aria-label={label}
        data-slot="board-columns"
        className={cn(
          // Room for a lifted card's shadow and a focus outline, inside the scroll.
          "-m-1 flex gap-4 overflow-x-auto p-1 pb-2",
          "@max-[639px]:scroll-px-1 @max-[639px]:snap-x @max-[639px]:snap-mandatory",
          drag && "@max-[639px]:snap-none"
        )}
      >
        {stages.map((col, colIndex) => {
          const inColumn = (order[col.id] ?? []).filter((id) => byId.has(id))
          const titleId = `${ids}-col-${colIndex}`
          const count = inColumn.length
          const target = drag?.target.column === col.id ? drag.target : null
          // Where the drop line goes: before the card now at that place, after the last, or into an empty column.
          const others = inColumn.filter((id) => id !== drag?.id)
          const before = target && target.index < others.length ? others[target.index] : null
          const after = target && target.index >= others.length && others.length ? others[others.length - 1] : null
          return (
            <div
              key={col.id}
              data-slot="board-column"
              data-column={col.id}
              data-drop-target={target ? "" : undefined}
              className={cn(
                "-m-1.5 flex min-w-60 flex-1 basis-0 flex-col gap-2.5 rounded-lg p-1.5 transition-colors duration-(--duration-fast)",
                "@max-[639px]:min-w-[85cqw] @max-[639px]:snap-start",
                // The column a dragged card is over takes the hover wash, which reads on the canvas in both themes.
                "data-[drop-target]:bg-hover forced-colors:data-[drop-target]:outline-2 forced-colors:data-[drop-target]:outline-dashed forced-colors:data-[drop-target]:outline-[color:Highlight]"
              )}
            >
              {/* The column's name labels its list, with the count in words: a list per stage, as the spec
                  has it. The board sits under the page's own heading. */}
              <div className="flex min-h-7 items-center gap-2 px-1">
                <span id={titleId} data-slot="board-column-title" className="min-w-0 truncate type-heading text-text-strong">
                  {col.title}
                  {count && !loading ? <span className="sr-only">, {counted(count, col.attention)}</span> : null}
                </span>
                {count && !loading ? (
                  <span
                    aria-hidden="true"
                    data-slot="board-column-count"
                    data-attention={col.attention || undefined}
                    className={cn(
                      "shrink-0 tabular-nums",
                      col.attention
                        ? "inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-highlight px-1.5 type-caption text-on-highlight"
                        : "type-meta text-text-muted"
                    )}
                  >
                    {formatNumber(count)}
                  </span>
                ) : null}
              </div>
              {loading ? (
                <div aria-hidden="true" className="flex flex-col gap-2">
                  {Array.from({ length: [3, 2, 2, 1][colIndex % 4] }, (_, i) => (
                    <div key={i} className="flex flex-col gap-2.5 rounded-md border border-line bg-surface p-3">
                      <Skeleton className={cn("h-3.5 rounded-xs", i % 2 ? "w-2/3" : "w-4/5")} />
                      <Skeleton className="h-3 w-1/2 rounded-xs" />
                    </div>
                  ))}
                </div>
              ) : count ? (
                <ul aria-labelledby={titleId} className="flex flex-col gap-2">
                  {inColumn.map((id, index) => {
                    const card = byId.get(id) as BoardCard
                    const dragging = drag?.id === id
                    const named = `Move ${card.title}`
                    const items: MenuEntry[] = stages
                      .filter((c) => c.id !== col.id)
                      .map((c) => ({
                        label: `Move to ${c.title}`,
                        icon: stages.indexOf(c) < colIndex ? "ArrowLeft" : "ArrowRight",
                        onSelect: () => commit(id, { column: c.id, index: 0 }, "menu"),
                      }))
                    if (count > 1) items.push("separator")
                    if (index > 0) items.push({ label: "Move up", icon: "ArrowUp", onSelect: () => commit(id, { column: col.id, index: index - 1 }, "menu") })
                    if (index < count - 1) items.push({ label: "Move down", icon: "ArrowDown", onSelect: () => commit(id, { column: col.id, index: index + 1 }, "menu") })
                    const titleClass = "type-heading-sm text-pretty text-text-strong after:absolute after:inset-0 after:rounded-md"
                    return (
                      <li
                        key={id}
                        ref={(node) => {
                          if (node) cardEls.current.set(id, node)
                          else cardEls.current.delete(id)
                        }}
                        data-slot="board-card"
                        data-card={id}
                        data-dragging={dragging || undefined}
                        data-moved={moved === id && !dragging ? "" : undefined}
                        data-drop={before === id ? "before" : after === id ? "after" : undefined}
                        onPointerDown={(event) => startDrag(event, id)}
                        onClickCapture={(event) => {
                          // The press that ended a drag does not also open the card.
                          if (!swallowClick.current) return
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onDragStart={(event) => event.preventDefault()}
                        className={cn(
                          "group/card relative flex flex-col gap-2.5 rounded-md border border-line bg-surface p-3 shadow-xs",
                          "transition-[background-color,border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-line-strong pointer-fine:cursor-grab",
                          // Being moved: lifted and following the pointer, so it shows by more than colour.
                          "data-[dragging]:z-20 data-[dragging]:cursor-grabbing data-[dragging]:border-line-strong data-[dragging]:shadow-lg data-[dragging]:transition-none forced-colors:data-[dragging]:outline-2 forced-colors:data-[dragging]:outline-[color:Highlight] forced-colors:data-[dragging]:outline-solid",
                          // Just moved: a moment in the highlight's quiet ground, so the eye finds it.
                          "data-[moved]:border-highlight data-[moved]:bg-highlight-soft",
                          // The drop line sits in the gap above or below, taking no room, so nothing jumps.
                          "data-[drop=before]:before:absolute data-[drop=before]:before:inset-x-0 data-[drop=before]:before:-top-1.5 data-[drop=before]:before:border-t-2 data-[drop=before]:before:border-focus",
                          "data-[drop=after]:after:absolute data-[drop=after]:after:inset-x-0 data-[drop=after]:after:-bottom-1.5 data-[drop=after]:after:border-t-2 data-[drop=after]:after:border-focus"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {/* On a touch screen, the handle drags; the card itself still scrolls the page. */}
                          <span
                            aria-hidden="true"
                            data-slot="board-card-handle"
                            className="relative z-10 -my-1 -ml-1.5 hidden w-6 shrink-0 touch-none items-center justify-center self-stretch text-text-subtle pointer-coarse:flex"
                          >
                            <Icon name="GripVertical" />
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1.5">
                            {card.href ? (
                              <Link href={card.href} draggable={false} data-slot="board-card-link" className={cn(titleClass, "rounded-xs underline-offset-4 hover:underline group-data-[dragging]/card:no-underline!")}>
                                {card.title}
                              </Link>
                            ) : onOpen ? (
                              <button type="button" data-slot="board-card-link" onClick={() => onOpen(id)} className={cn(titleClass, "rounded-xs text-left")}>
                                {card.title}
                              </button>
                            ) : (
                              <span data-slot="board-card-title" className="type-heading-sm text-pretty text-text-strong">
                                {card.title}
                              </span>
                            )}
                            {card.meta ? (
                              <p data-slot="board-card-meta" className="type-meta text-pretty text-text-muted">
                                {card.meta}
                              </p>
                            ) : null}
                          </div>
                          <Menu
                            ref={(node: HTMLElement | null) => {
                              if (node) triggers.current.set(id, node as HTMLButtonElement)
                              else triggers.current.delete(id)
                            }}
                            label={named}
                            items={items}
                            align="end"
                            trigger={<IconButton icon="ArrowRightLeft" label={named} size="sm" data-board-no-drag="" className="relative z-10 -mt-0.5 -mr-1.5" />}
                          />
                        </div>
                        {card.person || card.badge ? (
                          <div className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-2">
                            {card.person ? (
                              <span className="flex min-w-0 items-center gap-1.5">
                                <Avatar name={card.person} size={24} aria-hidden="true" />
                                <span className="truncate type-meta text-text-muted">{card.person}</span>
                              </span>
                            ) : null}
                            {card.badge ? (
                              <Badge tone={card.badge.tone ?? "neutral"} className={card.person ? "ml-auto" : undefined}>
                                {card.badge.label}
                              </Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              ) : failed ? null : (
                <div
                  data-slot="board-column-empty"
                  data-drop={target ? "into" : undefined}
                  className="rounded-md border border-dashed border-line-strong px-3 py-4 text-center type-meta text-text-subtle data-[drop=into]:border-focus"
                >
                  {empty}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p role="status" data-slot="board-status" className="sr-only">
        {message}
      </p>
    </div>
  )
})

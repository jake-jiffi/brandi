"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/select.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import * as ReactDOM from "react-dom"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"
import { Select as SelectPrimitive } from "radix-ui"

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

// Patched (07-starter.md, select): which hand is driving the list, and the trigger to give focus back to. The
// option in hand takes its 2px ring from the keyboard and only its edge from a pointer: Radix focuses options from
// script, which the browser may count as keyboard focus after a click, so :focus-visible cannot tell them apart.
interface SelectSharedState {
  keyboard: boolean
  setKeyboard: (keyboard: boolean) => void
  trigger: React.MutableRefObject<HTMLButtonElement | null>
}
const SelectSharedContext = React.createContext<SelectSharedState>({ keyboard: false, setKeyboard: () => undefined, trigger: { current: null } })

// Patched (07-starter.md, select): it closes at once and gives focus back at once. A list that faded out kept
// Radix's dismiss layer alive, so an Escape pressed during the fade was swallowed, and Radix returns focus on a
// timer, so the next key could land on the page. The close is flushed, then the trigger is focused here.
function Select({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [keyboard, setKeyboard] = React.useState(false)
  const [openState, setOpenState] = React.useState(defaultOpen)
  const trigger = React.useRef<HTMLButtonElement | null>(null)
  const shared = React.useMemo(() => ({ keyboard, setKeyboard, trigger }), [keyboard])
  return (
    <SelectSharedContext.Provider value={shared}>
      <SelectPrimitive.Root
        data-slot="select"
        {...props}
        open={openProp ?? openState}
        onOpenChange={(next) => {
          if (next) {
            setOpenState(true)
            onOpenChange?.(true)
            return
          }
          const inList = Boolean(document.activeElement?.closest('[data-slot="select-content"]'))
          ReactDOM.flushSync(() => {
            setOpenState(false)
            onOpenChange?.(false)
          })
          if (inList || document.activeElement === document.body) trigger.current?.focus({ preventScroll: true })
        }}
      />
    </SelectSharedContext.Provider>
  )
}

const SelectGroup = React.forwardRef(function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>, ref: React.ForwardedRef<any>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
      ref={ref}
    />
  )
})

const SelectValue = React.forwardRef(function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>, ref: React.ForwardedRef<any>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props}
      ref={ref} />
})

// Patched (07-starter.md, select trigger): the input's edge (line-control border, a 2px focus edge in place of
// the outline, a danger edge that stays danger when focused), the placeholder in text-subtle, 32, 36 or 44px
// (40, 44 or 48 on touch) with 16px text on touch, and full width so a Field can size it.
const SelectTrigger = React.forwardRef(function SelectTrigger({
  className,
  size = "default",
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default" | "lg"
}, ref: React.ForwardedRef<any>) {
  const { setKeyboard, trigger } = React.useContext(SelectSharedContext)
  const merged = useMergedRef(ref, trigger)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      onPointerDown={(event) => {
        setKeyboard(false)
        onPointerDown?.(event)
      }}
      onKeyDown={(event) => {
        setKeyboard(true)
        onKeyDown?.(event)
      }}
      className={cn(
        "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-control border border-line-control bg-surface px-3 text-left type-body text-text whitespace-nowrap hover:bg-surface-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_1px_var(--focus)] focus-visible:outline-hidden aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--danger)] disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-text-subtle pointer-coarse:h-11 pointer-coarse:type-body-lg data-[size=sm]:h-8 data-[size=sm]:pointer-coarse:h-10 data-[size=lg]:h-11 data-[size=lg]:type-body-lg data-[size=lg]:pointer-coarse:h-12 *:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={merged}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className="pointer-events-none size-4 text-text-muted"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

// Patched (07-starter.md, select): the list opens below its trigger and flips up when there is no room
// (popper), on the raised surface with a hairline and shadow-md, above dialogs (z-popover), at least as wide
// as its trigger. It fades in through tw-animate-css, which reduced motion keeps to a fade, and leaves at once
// with no exit animation (see Select above). Exported so a list drawn open in place for a design (Select's open
// prop) matches the live one.
export const selectContentClassName =
  "relative z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-line bg-surface-raised p-1 text-text shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95"

const SelectContent = React.forwardRef(function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  onKeyDown,
  onPointerMove,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>, ref: React.ForwardedRef<any>) {
  const { keyboard, setKeyboard } = React.useContext(SelectSharedContext)
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        data-keyboard={keyboard || undefined}
        className={cn(
          selectContentClassName,
          "group/select-list data-[align-trigger=true]:animate-none",
          className
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        onKeyDown={(event) => {
          setKeyboard(true)
          // The option has already been chosen and focus given back; Enter's own default would now press the
          // trigger and open the list again. Radix already does the same for Space.
          if (event.key === "Enter") event.preventDefault()
          onKeyDown?.(event)
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") setKeyboard(false)
          onPointerMove?.(event)
        }}
        // Select gave focus back already; Radix's own return comes on a timer and could pull focus from wherever
        // the person has moved on to since.
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseAutoFocus?.(event)
        }}
        {...props}
      ref={ref}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

const SelectLabel = React.forwardRef(function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>, ref: React.ForwardedRef<any>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2.5 pt-2 pb-1 type-eyebrow text-text-subtle", className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, select): the option in hand gets the hover tint and a 1px inset edge in line-control
// (3:1, where a tint alone measured 1.14:1); from the keyboard the edge becomes a 2px ring in focus. Both are an
// outline drawn inside the option, because the list scrolls, and because a tint with a box-shadow edge reads
// as a card inside the list. 36px rows, 44 on touch. A description sits under the label, outside the text the
// trigger copies. Forced colours outline the option in hand (globals.css).
export const selectItemClassName =
  "relative flex min-h-9 w-full cursor-default flex-col items-stretch justify-center gap-0.5 rounded-control py-2 pr-9 pl-2.5 type-body text-text select-none data-highlighted:bg-hover data-highlighted:outline-1 data-highlighted:outline-solid data-highlighted:outline-line-control data-highlighted:-outline-offset-1 group-data-keyboard/select-list:data-highlighted:outline-2 group-data-keyboard/select-list:data-highlighted:outline-focus group-data-keyboard/select-list:data-highlighted:outline-offset-[-2px] data-disabled:pointer-events-none data-disabled:opacity-50 pointer-coarse:min-h-11 pointer-coarse:py-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const SelectItem = React.forwardRef(function SelectItem({
  className,
  children,
  description,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { description?: React.ReactNode }, ref: React.ForwardedRef<any>) {
  const descriptionId = React.useId()
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectItemClassName, className)}
      aria-describedby={description ? descriptionId : undefined}
      {...props}
      ref={ref}
    >
      <span className="pointer-events-none absolute top-2.5 right-2.5 flex size-4 items-center justify-center text-primary pointer-coarse:top-3.5">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon
            className="pointer-events-none"
          />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {description ? (
        <span id={descriptionId} data-slot="select-item-description" className="type-meta text-text-muted">
          {description}
        </span>
      ) : null}
    </SelectPrimitive.Item>
  )
})

const SelectSeparator = React.forwardRef(function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>, ref: React.ForwardedRef<any>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-line", className)}
      {...props}
      ref={ref}
    />
  )
})

const SelectScrollUpButton = React.forwardRef(function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>, ref: React.ForwardedRef<any>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-surface-raised py-1 text-text-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={ref}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
})

const SelectScrollDownButton = React.forwardRef(function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>, ref: React.ForwardedRef<any>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-surface-raised py-1 text-text-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      ref={ref}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
})

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

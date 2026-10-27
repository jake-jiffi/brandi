"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/calendar.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
  type Modifiers,
} from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

// Patched (07-starter.md, calendar): a day's state is drawn on its cell, so one rule holds whether the days are
// buttons (a live calendar) or text (a still picture for a design). Chosen days and a range's ends are the primary
// fill, a range's middle the strong selected tint as one band, the days a range would take while its end is being
// chosen (a `preview` modifier) the light tint, today a dot under the number. Forced colours keep each one: the
// ends in Highlight, the middle edged in Highlight, the dot in CanvasText.
function dayStateClass(m: Modifiers) {
  // A hidden day (another month's, beside its own) draws nothing, whatever it matches.
  if (m.hidden) return ""
  const end = m.range_start || m.range_end
  return cn(
    m.outside && "text-text-subtle",
    m.disabled && "text-text-subtle line-through decoration-text-subtle",
    m.preview && !m.selected && "bg-selected text-text-strong",
    m.selected && !m.range_middle && !end && "rounded-control bg-primary text-on-primary forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
    // The band rounds off where a week starts and ends, so each row reads as one stretch.
    m.range_middle && "bg-selected-strong text-text-strong first:rounded-l-control last:rounded-r-control forced-colors:border-y forced-colors:border-[Highlight]",
    end && "bg-primary text-on-primary forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
    m.range_start && "rounded-l-control",
    m.range_end && "rounded-r-control",
    m.today &&
      "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-current forced-colors:after:bg-[CanvasText] forced-colors:after:forced-color-adjust-none pointer-coarse:after:bottom-1.5"
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // Patched (07-starter.md, calendar): 36px days, 44px on touch, on whatever surface holds it.
        "group/calendar p-1 [--cell-size:--spacing(9)] pointer-coarse:[--cell-size:--spacing(11)]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      // Patched (07-starter.md, calendar): the system's roles, type and sizes. Months sit side by side and wrap
      // when there is no room, never by the window's width. Navigation is the ghost icon button.
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-wrap gap-x-6 gap-y-4",
          defaultClassNames.months
        ),
        month: cn("flex flex-col gap-2", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          "text-text-muted select-none hover:text-text-strong aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          "text-text-muted select-none hover:text-text-strong aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-10 pointer-coarse:h-10",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 type-label",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-control",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-surface-raised opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "type-heading-sm text-text-strong select-none",
          captionLayout === "label"
            ? ""
            : "flex items-center gap-1 rounded-control [&>svg]:size-3.5 [&>svg]:text-text-muted",
          defaultClassNames.caption_label
        ),
        month_grid: cn("border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex h-7 w-(--cell-size) items-center justify-center type-caption text-text-subtle select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "type-caption text-text-subtle select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative size-(--cell-size) p-0 text-center type-body tabular-nums text-text select-none",
          defaultClassNames.day
        ),
        outside: defaultClassNames.outside,
        disabled: defaultClassNames.disabled,
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      // Patched (07-starter.md, calendar): the parts are made once, outside the render. Made inline, each render was a
      // new component, so every day was thrown away and mounted again, and the focused day took focus afresh: a
      // calendar that set state on focus (a range's preview) looped.
      components={{ ...CALENDAR_PARTS, ...components }}
      {...props}
    />
  )
}

const CALENDAR_PARTS: React.ComponentProps<typeof DayPicker>["components"] = {
  Root: ({ className, rootRef, ...props }) => {
    return (
      <div
        data-slot="calendar"
        ref={rootRef}
        className={cn(className)}
        {...props}
      />
    )
  },
  Chevron: ({ className, orientation, ...props }) => {
    if (orientation === "left") {
      return (
        <ChevronLeftIcon
          className={cn("cn-rtl-flip size-4", className)}
          {...props}
        />
      )
    }

    if (orientation === "right") {
      return (
        <ChevronRightIcon
          className={cn("cn-rtl-flip size-4", className)}
          {...props}
        />
      )
    }

    return (
      <ChevronDownIcon
        className={cn("size-4", className)}
        {...props}
      />
    )
  },
  // Patched (07-starter.md, calendar): the cell carries the day's state (see dayStateClass).
  Day: ({ day, modifiers, className, ...props }) => (
    <td data-slot="calendar-day" className={cn(className, dayStateClass(modifiers))} {...props} />
  ),
  DayButton: (props) => <CalendarDayButton {...props} />,
  WeekNumber: ({ children, ...props }) => {
    return (
      <td {...props}>
        <div className="flex size-(--cell-size) items-center justify-center text-center">
          {children}
        </div>
      </td>
    )
  },
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    // Patched (07-starter.md, calendar): moving the focus never scrolls the page, including the moment a calendar
    // opens in a popover that has not been placed yet.
    if (modifiers.focused) ref.current?.focus({ preventScroll: true })
  }, [modifiers.focused])

  // Patched (07-starter.md, calendar): a plain button that fills its cell and takes the cell's colours. Hover is the
  // hover wash; focus is the system's outline, which a selected day keeps 2px clear of its fill. 36px, 44 on touch.
  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day-button"
      data-day={day.isoDate}
      className={cn(
        "relative flex size-full items-center justify-center rounded-control text-inherit transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:hover:bg-transparent aria-disabled:cursor-not-allowed",
        defaultClassNames.day_button,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

// Dates as the product writes them, in the market's locale: "29 Oct" in tables, "Thu 29 Oct" where the day
// of the week matters, "29 October 2026" in sentences. Never by hand. A calendar date (an ISO day with no
// time) is the same day everywhere, so it is read and written in UTC and never shifts with the time zone.

import { LOCALE } from "./format-locale.js"

export type DateStyle = "table" | "day" | "sentence"

const OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  table: { day: "numeric", month: "short" },
  day: { weekday: "short", day: "numeric", month: "short" },
  sentence: { day: "numeric", month: "long", year: "numeric" },
}

const formats = new Map<DateStyle, Intl.DateTimeFormat>()
const asDay = (iso: string) => new Date(`${iso}T00:00:00Z`)

/** A calendar date ("2026-10-29") in one of the product's styles. Anything that is not a date gives "". */
export function formatDate(iso: string | null | undefined, style: DateStyle = "table") {
  if (!iso) return ""
  const day = asDay(iso)
  if (Number.isNaN(day.getTime())) return ""
  let f = formats.get(style)
  if (!f) formats.set(style, (f = new Intl.DateTimeFormat(LOCALE, { ...OPTIONS[style], timeZone: "UTC" })))
  // "Thu 29 Oct", as the writing rules have it: the parts in the locale's order, without the comma Intl puts
  // after the day of the week.
  if (style === "day") return f.formatToParts(day).filter((p) => p.type !== "literal").map((p) => p.value).join(" ")
  return f.format(day)
}

/** The calendar date `days` after (or before) another. */
export function addDays(iso: string, days: number) {
  const day = asDay(iso)
  day.setUTCDate(day.getUTCDate() + days)
  return day.toISOString().slice(0, 10)
}

/** Today's calendar date in a time zone, as "2026-10-29": the business's day, not the server's. */
export function todayIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
}

// The system's one number formatter. The starter imports this file and the canvas bundle is built
// from it, so a figure reads the same on a board, in a preview and in production. The contract and
// its case table are in the product-system skill (03-fundamentals-first.md, section 4).
import { CURRENCY, LOCALE, TIME } from "./format-locale.js"

export const NUMBER_STYLES = Object.freeze(["number", "currency", "compact", "compact-currency", "percent", "points", "hours"])

const formats = new Map()
function nf(locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`
  let f = formats.get(key)
  if (!f) {
    // "negative": a value that rounds to zero is never shown as -0.
    f = new Intl.NumberFormat(locale, { signDisplay: "negative", ...options })
    formats.set(key, f)
  }
  return f
}

/**
 * Format a number in one of the system's named styles.
 * Missing and non-finite values give an empty string, never "NaN" or "0".
 * `percent` takes percentage points (12.5 is 12.5%) and never multiplies by 100.
 */
export function formatNumber(value, style = "number", { locale = LOCALE, currency = CURRENCY, digits } = {}) {
  if (value === null || value === undefined || value === "") return ""
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return ""
  switch (style) {
    case "currency": {
      // Cents only when there are cents, decided after rounding the way the output rounds.
      const cents = nf("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(n)
      const whole = cents.endsWith(".00")
      const places = whole ? 0 : 2
      return nf(locale, { style: "currency", currency, minimumFractionDigits: places, maximumFractionDigits: places }).format(n)
    }
    case "compact":
      return nf(locale, { notation: "compact" }).format(n)
    case "compact-currency":
      return nf(locale, { style: "currency", currency, notation: "compact" }).format(n)
    case "percent":
      return nf(locale, { style: "percent", maximumFractionDigits: digits ?? 1 }).format(n / 100)
    case "points": {
      const figure = nf(locale, { maximumFractionDigits: digits ?? 1 }).format(n)
      const one = nf("en-US", { maximumFractionDigits: digits ?? 1, useGrouping: false }).format(Math.abs(n)) === "1"
      return `${figure} ${one ? "pt" : "pts"}`
    }
    case "hours":
      return `${nf(locale, { maximumFractionDigits: digits ?? 2 }).format(n)} h`
    case "number":
    default:
      return nf(locale, { maximumFractionDigits: digits ?? 2 }).format(n)
  }
}

const times = new Map()
function dtf(locale) {
  let f = times.get(locale)
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" })
    times.set(locale, f)
  }
  return f
}

/** A time's clock and its am or pm, written the way the brand writes times. Null when it is not a time. */
function timeParts(value, { locale = LOCALE, time = TIME, keepMinutes } = {}) {
  const d = value instanceof Date ? value : typeof value === "number" ? new Date(2026, 0, 1, Math.floor(value / 60), value % 60) : null
  if (!d || Number.isNaN(d.getTime())) return null
  const parts = dtf(locale).formatToParts(d)
  const hour = parts.find((p) => p.type === "hour")?.value ?? ""
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00"
  const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "").toLowerCase().replace(/\./g, "")
  const keep = keepMinutes ?? (time.onTheHour === "keep" || d.getMinutes() !== 0)
  return { clock: keep ? `${hour}${time.minutes ?? ":"}${minute}` : hour, period }
}
const withPeriod = ({ clock, period }, time) => (period ? `${clock}${time.space === false ? "" : " "}${period}` : clock)

/**
 * A time, from a Date or minutes after midnight, as the brand writes it (TIME in lib/format-locale.js):
 * 9:30 am by default, 10.30pm with { minutes: ".", onTheHour: "drop", space: false }. onTheHour can be
 * given here too: "keep" (9:00 am), "drop" (9 am).
 */
export function formatTime(value, { locale = LOCALE, time = TIME, onTheHour } = {}) {
  const t = onTheHour ? { ...time, onTheHour } : time
  const p = timeParts(value, { locale, time: t })
  return p ? withPeriod(p, t) : ""
}

/**
 * A span of time, joined with "to", with one am or pm where both ends share it: 8 to 10 am, 7 am to 3 pm.
 * onTheHour "pair" drops the minutes only when both ends are on the hour (7:00 am to 12:30 pm), "drop"
 * drops them at each end (11am to 10.30pm), "keep" keeps them.
 */
export function formatTimeRange(a, b, { locale = LOCALE, time = TIME, onTheHour = time.onTheHour } = {}) {
  // On the hour at both ends, given as Dates or as minutes after midnight.
  const minuteOf = (v) => (v instanceof Date ? v.getMinutes() : typeof v === "number" ? v % 60 : NaN)
  const both = minuteOf(a) === 0 && minuteOf(b) === 0
  const keepMinutes = onTheHour === "keep" ? true : onTheHour === "pair" ? !both : undefined
  const t = { ...time, onTheHour: onTheHour === "pair" ? "drop" : onTheHour }
  const pa = timeParts(a, { locale, time: t, keepMinutes })
  const pb = timeParts(b, { locale, time: t, keepMinutes })
  if (!pa || !pb) return ""
  return `${pa.period && pa.period === pb.period ? pa.clock : withPeriod(pa, t)} to ${withPeriod(pb, t)}`
}


// The system's one number formatter. The starter imports this file and the canvas bundle is built
// from it, so a figure reads the same on a board, in a preview and in production. The contract and
// its case table are in the product-system skill (03-fundamentals-first.md, section 4).
import { CURRENCY, LOCALE } from "./format-locale.js"

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

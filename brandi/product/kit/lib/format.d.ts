export type NumberStyle = "number" | "currency" | "compact" | "compact-currency" | "percent" | "points" | "hours"

export declare const NUMBER_STYLES: readonly NumberStyle[]

/**
 * Format a number in one of the system's named styles, in the market's locale and currency.
 * Missing and non-finite values give an empty string. `percent` takes percentage points.
 */
export declare function formatNumber(
  value: number | string | null | undefined,
  style?: NumberStyle,
  options?: { locale?: string; currency?: string; digits?: number }
): string

/** How a time is written: minutes after a ":" or a ".", minutes on the hour kept or dropped, a space before am or pm or not. */
export type TimeStyle = { minutes: ":" | "."; onTheHour: "keep" | "drop"; space: boolean }

/**
 * A time, from a Date or minutes after midnight, written the way the brand writes times (TIME in
 * lib/format-locale.js): 9:30 am by default, 10.30pm for { minutes: ".", onTheHour: "drop", space: false }.
 */
export declare function formatTime(
  value: Date | number,
  options?: { locale?: string; time?: TimeStyle; onTheHour?: "keep" | "drop" }
): string

/**
 * A span of time joined with "to", with one am or pm where both ends share it: 8 to 10 am, 11am to 10.30pm.
 * "pair" drops the minutes only when both ends are on the hour.
 */
export declare function formatTimeRange(
  a: Date | number,
  b: Date | number,
  options?: { locale?: string; time?: TimeStyle; onTheHour?: "keep" | "drop" | "pair" }
): string


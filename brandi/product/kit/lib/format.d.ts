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

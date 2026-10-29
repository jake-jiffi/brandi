// The canvas bundle: the system's components under the system's namespace, for boards to mount with
// <x-import component-from-global-scope="<Namespace>.<Export>">. Built by tools/build-canvas.mjs from
// the same files the product ships, so a board shows exactly what production renders.
export * from "@/components/system"
export { formatNumber, formatTime, formatTimeRange, NUMBER_STYLES } from "@/lib/format"
// The brand and product names, so a check can expect "[Brand] [product]" for whatever brand it runs on.
export { BRAND, STAND_IN_MARKS } from "@/lib/brand"
export { PRODUCT } from "@/lib/product"
export { ICON_NAMES } from "@/lib/icons"
export { Root } from "./root"

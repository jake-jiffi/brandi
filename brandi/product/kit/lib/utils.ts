import { createCn } from "cn/config"

// The system's own radius and shadow names, so a later class beats an earlier one of the same kind. Without them
// `rounded-md rounded-action` kept both, the cascade picked 16px, and a segmented control was drawn as a pill.
export const cn = createCn({
  extend: { theme: { radius: ["control", "action", "list", "frame", "rail", "pill"], shadow: ["rail"] } },
})

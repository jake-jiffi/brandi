// The product's name and language, set once, and three things read off the system. `brandi product starter` writes this file.
// railTone: whether the rail is dark in the light theme. The kit's rail and top bar follow the rail as it renders instead
// (--rail-mark-on-light and --rail-mark-on-dark, which a direction's class can flip); components from an older kit read this.
// lockupName: how the product name is set beside the mark, a brand-to-product decision.
// avoidTags: tag tints on a hue the brand keeps off its grounds (charts.avoid), which a name's hash never lands on.
export const PRODUCT = { name: "Product", lang: "en", railTone: "light", lockupName: "label", avoidTags: [] } as {
  name: string
  lang: string
  railTone: "light" | "dark"
  lockupName: "label" | "eyebrow"
  avoidTags: string[]
}

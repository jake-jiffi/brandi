// The product's name and language, set once, and two things read off the system. `brandi product starter` writes this file.
// railTone: whether the rail is dark in the light theme, so the rail's lockup takes the mark drawn for dark grounds.
// lockupName: how the product name is set beside the mark, a brand-to-product decision.
export const PRODUCT = { name: "Product", lang: "en", railTone: "light", lockupName: "label" } as {
  name: string
  lang: string
  railTone: "light" | "dark"
  lockupName: "label" | "eyebrow"
}

# Icon on the web

An icon is an inline graphic from the one icon set, drawn in `currentColor`, and the web has no icon control.

```yaml
component: Icon
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-8
    url: https://www.w3.org/TR/wai-aria-1.2/
    marker: Recommendation 2023-06-06, 1.3 Working Draft 2026-06-04
    read: 2026-10-27
  - key: WEB-9
    url: https://www.w3.org/TR/mediaqueries-5/
    marker: Working Draft 2026-02-19
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. An icon is an image, not a control, and HTML `img` is the related concept of the `img` role [WEB-8]. A lone icon that acts is an IconButton. |
| Target and spacing | None. An icon is not a target. The control that holds it meets 2.5.8 [WEB-1]. |
| Type | Not text, so the resize floor (1.4.4) applies to the words beside it, not to the glyph [WEB-1]. Sizes run 12, 14, 16, 18, 20 and 24 CSS px by context. |
| Colour and theme | Drawn in `currentColor`, so it takes the colour of the text beside it. An icon that carries meaning, such as a status icon, needs 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | None of its own. It takes its parent's state colour, and meaning never rides on its colour alone (1.4.1) [WEB-1]. |
| Motion | None. A static glyph. An icon that moves is a Spinner, which follows `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Hidden unless it has a `label`: `aria-hidden="true"` takes it out of the tree [WEB-8], and pure decoration needs no text alternative (1.1.1) [WEB-1]. With a `label` it is role `img`, which ARIA requires to be named by `aria-label` or `aria-labelledby` [WEB-8]. An `img` has presentational children, so the drawing's parts stay out of the tree [WEB-8]. |
| Navigation placement | Inline, beside the words it supports: buttons, inputs, menus, tables, chips, meta lines and the rail. A lone icon that acts takes its name from IconButton (4.1.2) [WEB-1]. |
| Keyboard, pointer, trackpad | None. An icon never takes focus. The keyboard reaches the control around it (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | One set only, never emoji and never a second library (Lucide in the reference), its stroke, and the sizes by context, inside the 3:1 floor for icons that carry meaning (1.4.11) [WEB-1]. Status icons take the status text colour. |
| Platform owns | Removing `aria-hidden="true"` content from the accessibility tree [WEB-8]. The forced colours palette, which the user agent supplies [WEB-9]. |
| Not confirmed | Accessibility API: how browsers expose inline SVG, since SVG Accessibility API Mappings was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

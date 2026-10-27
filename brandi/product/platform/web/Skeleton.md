# Skeleton on the web

The skeleton draws grey shapes where content is about to appear, in that content's layout, hidden from screen readers.

```yaml
component: Skeleton
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-7
    url: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
    marker: undated
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
| Native control | None. Hidden decoration with `aria-hidden="true"`, while the area it fills carries `aria-busy="true"` [WEB-8]. |
| Target and spacing | None. It is never pressable [WEB-1]. |
| Type | None. It draws no text, and the content that replaces it meets 1.4.4 [WEB-1]. |
| Colour and theme | While it is hidden decoration, 1.4.11 sets no contrast for its shapes [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Shimmering, or still under reduced motion. Gone when the content arrives [WEB-8]. |
| Motion | The shimmer stops under `prefers-reduced-motion` [WEB-9]. A shimmer never flashes more than three times a second (2.3.1), and one that runs past five seconds beside other content needs a pause, stop or hide control (2.2.2) [WEB-1]. |
| Accessibility API | Hidden with `aria-hidden="true"` [WEB-8]. "Loading" is said once, nearby, through a `status` [WEB-8]. |
| Navigation placement | In the place and shape of the content about to appear [WEB-7]. |
| Keyboard, pointer, trackpad | None. It is hidden and never focusable (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The shapes, `width`, `height`, `circle`, `lines`, the grey and the shimmer's speed [WEB-1]. |
| Platform owns | Taking `aria-hidden="true"` content out of the tree [WEB-8]. |
| Not confirmed | Motion: whether a loading shimmer counts as essential under 2.2.2, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

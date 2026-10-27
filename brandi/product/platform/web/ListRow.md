# ListRow on the web

The list row is one record in a List, with a lead, a bold title, a meta line and a trailing badge, value or chevron, built on an HTML `li`.

```yaml
component: ListRow
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-3
    url: https://www.w3.org/WAI/ARIA/apg/patterns/button/
    marker: undated
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
| Native control | An HTML `li`, the base concept of `listitem` [WEB-8], whose title is an `a` with `href` or a `button` with `onClick`, since a link navigates and a button acts [WEB-3]. |
| Target and spacing | The row's link or button covers the row and meets 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. On a wide list long text is cut with an ellipsis. Under 480 CSS px of list it wraps to two lines. |
| Colour and theme | `selected` takes `selected-strong` with a `selected-line` edge, a cue beyond colour (1.4.1) at 3:1 (1.4.11) [WEB-1]. `unread` adds a dot and hidden words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus, `selected` for the open record, and `unread`. The open row takes `aria-current="true"` [WEB-8]. Focus shows on the selected row too (2.4.7) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `listitem` whose link or button is named by the title [WEB-8]. `unread` adds "(unread)" for screen readers, and the chevron is hidden [WEB-8]. A cut title keeps its full text reachable without a mouse (2.1.1) [WEB-1]. |
| Navigation placement | Inside a List [WEB-7]. |
| Keyboard, pointer, trackpad | Tab reaches the row's link or button, which opens the record (2.1.1) [WEB-1]. Space and Enter activate a button row [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The lead tile, density, the 480 CSS px wrap and the chevron, inside the floors [WEB-1]. A badge is never squeezed to its dot. |
| Platform owns | Link and button roles and activation [WEB-3] [WEB-8]. |
| Not confirmed | Type: whether text cut by CSS keeps its full text in the tree, since CSS Overflow was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

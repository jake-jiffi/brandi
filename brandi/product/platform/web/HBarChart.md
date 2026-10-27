# HBarChart on the web

The horizontal bar chart ranks a top N with direct labels and values, and on the web it reads as an ordered list.

```yaml
component: HBarChart
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
| Native control | None as a chart. An ordered list, base concept HTML `ol`, where each item gives its label and value as text and the bar is hidden [WEB-8]. |
| Target and spacing | None of its own. A link to the full table meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Labels and values are live text, not part of the drawing. |
| Colour and theme | Bars in `series-1` by default, 3:1 against the surface (1.4.11) [WEB-1]. Values are printed, so colour carries nothing on its own (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Data, or `empty` when there is none. The rank order is meaningful, so the reading order matches it (1.3.2) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `list` read in order, each item's label with its value [WEB-8]. The bars take `aria-hidden="true"` [WEB-8]. |
| Navigation placement | Inside a ChartFigure or a Card [WEB-7]. |
| Keyboard, pointer, trackpad | None of its own. A static list needs no key handling, and a link inside is a Tab stop (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Bar colour, `max`, and ten rows at most, sorted descending, with the rest as "Other" or a link to the full table, inside 3:1 [WEB-1]. |
| Platform owns | List semantics from `ol` and `li` [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

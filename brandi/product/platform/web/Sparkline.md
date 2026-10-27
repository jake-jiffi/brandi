# Sparkline on the web

The sparkline is a tiny trend with its last point marked, inside a MetricCard or a table cell, drawn as SVG.

```yaml
component: Sparkline
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
| Native control | None. An `img` named by `label`, or hidden when it has none [WEB-8]. |
| Target and spacing | None. It is never pressable [WEB-1]. |
| Type | None. No axes and no text, so 1.4.4 applies to the figure beside it [WEB-1]. |
| Colour and theme | Always `series-1`, never red or green, since the Delta beside it gives the judgement (1.4.1) [WEB-1]. 3:1 against the surface when it carries meaning (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | A line, broken where a value is `null`. No interactive states, and it is hidden when it has no `label` [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | With `label`, an `img` named by the trend in words [WEB-8]. Without it, `aria-hidden="true"` [WEB-8], since the figure beside it carries the meaning (1.1.1) [WEB-1]. |
| Navigation placement | Inside a MetricCard or a table cell [WEB-7]. |
| Keyboard, pointer, trackpad | None. It never takes focus (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Width, height, stroke and the last-point mark, in `series-1` only [WEB-1]. It supports a figure and never stands in for one. |
| Platform owns | Taking hidden content out of the tree [WEB-8]. |
| Not confirmed | Accessibility API: how browsers expose SVG, since SVG Accessibility API Mappings was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

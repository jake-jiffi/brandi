# ChartFigure on the web

The chart figure is a chart's frame, with a heading, the takeaway in one sentence, the chart and the same numbers as a hidden table, built on the HTML `figure` element.

```yaml
component: ChartFigure
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-5
    url: https://www.w3.org/WAI/ARIA/apg/patterns/table/
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
| Native control | HTML `figure`, the related concept of the `figure` role [WEB-8]. A caption can be HTML `figcaption`, a related concept of the `caption` role [WEB-8]. |
| Target and spacing | None of its own. The chart inside follows its own spec, and any control meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The takeaway is one sentence. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Charts sit on a surface, since the series colours are solved to 3:1 against it (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | The chart's `loading`, `error` and `empty`. While the chart loads the figure carries `aria-busy="true"` [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `figure` named by its heading through `aria-labelledby` and described by the takeaway through `aria-describedby` [WEB-8]. The hidden table is a native `table` whose first column holds row headers, `th` with a row scope [WEB-8] [WEB-5]. |
| Navigation placement | In cards and pages, on a surface [WEB-7]. |
| Keyboard, pointer, trackpad | The chart inside takes focus and moves through its points (2.1.1) [WEB-1]. The hidden table is static and holds no focus stops [WEB-5]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The heading level, the takeaway's wording and the series `var(--chart-1)` to `var(--chart-6)` in fixed order, inside the floors [WEB-1]. |
| Platform owns | Figure and table semantics [WEB-8]. |
| Not confirmed | Accessibility API: the visually hidden text technique for the table, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

# LineChart on the web

The line chart shows a trend over time, with an optional comparison series, as the system's own SVG, since the web has no chart control.

```yaml
component: LineChart
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-2
    url: https://www.w3.org/WAI/ARIA/apg/
    marker: APG 1.2, undated
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
| Native control | None. APG's patterns index has no chart pattern [WEB-2]. The picture is an `img` named by its title and takeaway [WEB-8], and the same numbers sit in a visually hidden `table` [WEB-5]. |
| Target and spacing | The plot is one area that shows values on hover, not a set of small targets. Any control in or beside it meets 2.5.8 [WEB-1]. |
| Type | Axis and end-label text from the brand ramp, 4.5:1 in both themes (1.4.3) [WEB-1]. Text inside SVG gets its own check, since the usual tools do not read it. |
| Colour and theme | Lines are 3:1 against the surface (1.4.11) [WEB-1]. A comparison is grey and dashed, so it differs by pattern as well as colour, and two to four lines are named at their ends (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | `loading` as a skeleton the chart's size, `error` and `empty`. While loading the chart carries `aria-busy="true"` [WEB-8]. A `null` breaks the line, never drawn as zero. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | An `img` named from `title` and `summary` [WEB-8]. A visually hidden table carries every value, its first column naming each row (1.1.1) [WEB-1] [WEB-5]. The point in hand, with every series at that point, is announced through a polite `status` [WEB-8]. |
| Navigation placement | Inside a ChartFigure, on a surface [WEB-7]. |
| Keyboard, pointer, trackpad | The plot takes focus. Left and Right, with Home and End for the ends, move through the points, show the tooltip and announce the point (2.1.1) [WEB-1]. The tooltip stays inside the plot. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Series tokens in fixed order, 2.25 CSS px lines, the optional `area` fill and `labels`, inside the 3:1 floor [WEB-1]. End labels down to 280 CSS px wide. Five or more lines are too many for one chart. |
| Platform owns | When assistive tech speaks the polite `status` [WEB-8]. |
| Not confirmed | Accessibility API: how browsers expose SVG, since SVG Accessibility API Mappings was not read. Accessibility API: the role for a plot that takes focus, since APG has no chart pattern and an `img` has presentational children [WEB-2] [WEB-8]. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

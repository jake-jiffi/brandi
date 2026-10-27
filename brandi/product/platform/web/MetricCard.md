# MetricCard on the web

The metric card is a headline figure with its label, change, comparison and footnote, built from a Card, a Delta and an optional Sparkline.

```yaml
component: MetricCard
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
| Native control | None. A Card whose label is the heading, with the figure as text, a Delta and an optional Sparkline [WEB-8]. |
| Target and spacing | The hint's info button meets 2.5.8 [WEB-1]. |
| Type | Tabular figures. The figure shrinks with its card, not the window, and must still grow at 200% zoom (1.4.4) [WEB-1]. |
| Colour and theme | Figure and label 4.5:1, or 3:1 as large text (1.4.3) [WEB-1]. The Delta's colour is never alone (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | `ready`, `loading` with a Skeleton, or `unavailable` with when the source last answered, never a zero nobody measured. While loading the card can carry `aria-busy="true"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The label is the heading, the figure is text and the Delta reads as one phrase [WEB-8]. `hint` is a toggletip: a `button` whose message is announced as it opens (4.1.3) [WEB-1]. A Sparkline without a label is hidden [WEB-8]. |
| Navigation placement | In a row of cards on a dashboard, with one `hero` a row at most [WEB-7]. |
| Keyboard, pointer, trackpad | The info button: Tab, then Space or Enter opens the hint [WEB-3]. Hover shows it after a short delay, and it stays while the pointer is over it and dismisses with Escape (1.4.13) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Card styling, `hero`, rounding on cards ($18K) and the 150 ms hover delay, inside the floors [WEB-1]. The label says exactly what is counted. |
| Platform owns | Space and Enter activation on the info button [WEB-3]. |
| Not confirmed | Type: container queries, since no CSS specification that defines them is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

# Delta on the web

The delta shows change against a comparison as an arrow and a value, read as one judgement, and it is text on the web.

```yaml
component: Delta
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
| Native control | None. Text with a hidden arrow [WEB-8]. |
| Target and spacing | None. A delta is never a target [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. A change in a rate is in points ("3 pts"). |
| Colour and theme | The colour gives the judgement, the arrow the direction and the words both, so colour is never alone (1.4.1) [WEB-1]. Text 4.5:1 (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Up, down or flat, judged good, bad or neither by `goodWhen`. Each judgement is said in words as well as colour (1.4.1) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Read as one phrase: "Up 6.2%, better vs last month". A `generic` element cannot take `aria-label` [WEB-8], so the phrase is visually hidden text, and the arrow is hidden [WEB-8]. |
| Navigation placement | Beside a figure, in a MetricCard or a table cell [WEB-7]. |
| Keyboard, pointer, trackpad | None. It never takes focus (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The arrow's shape, `format` (`percent` by default, or `points`), and the success, danger and neutral colours, inside the floors [WEB-1]. Costs, overdue amounts and churn are `goodWhen="down"`. |
| Platform owns | Taking hidden content out of the tree [WEB-8]. |
| Not confirmed | Accessibility API: the visually hidden text technique, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

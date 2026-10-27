# ShareBar on the web

The share bar shows shares of a whole as one segmented bar with a legend that prints every share, in place of pie and donut charts.

```yaml
component: ShareBar
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
| Native control | None. The legend is a `list` of labels and shares as text, and the bar is hidden decoration beside it [WEB-8]. |
| Target and spacing | None. Nothing in it is pressable [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Neighbouring segments are 3:1 against each other, or kept apart by a gap (1.4.11) [WEB-1]. The legend prints every share, so colour is never alone (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Data, `loading` or `empty`. Zero and negative values are left out. While loading it carries `aria-busy="true"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The legend's text is the text alternative (1.1.1) [WEB-1]. The bar takes `aria-hidden="true"` [WEB-8]. |
| Navigation placement | Inside a ChartFigure or a Card [WEB-7]. |
| Keyboard, pointer, trackpad | None needed. The legend prints every share, so nothing waits behind hover (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Segment colours in fixed series order, the bar's height and the legend layout, inside 3:1 [WEB-1]. Never a pie or a donut. |
| Platform owns | List semantics and taking hidden content out of the tree [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

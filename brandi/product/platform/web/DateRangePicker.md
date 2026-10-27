# DateRangePicker on the web

The date range picker takes a period for a report, start and end, built as two date fields that share a calendar dialog.

```yaml
component: DateRangePicker
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-4
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    marker: undated
    read: 2026-10-27
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | Two text inputs, start and end, in a named `group`, whose related concept is HTML `fieldset` [WEB-8]. They share a calendar `dialog` [WEB-6] with a `grid` of days [WEB-4]. |
| Target and spacing | Each day and button meets 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The range shows by more than a tint: its ends are marked and the words name them (1.4.1), with marks at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Start chosen, end chosen, invalid when the end comes first, and the comparison period. Days in the range carry `aria-selected="true"` [WEB-4]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `group` named for the period [WEB-8], with fields labelled "Start date" and "End date" (3.3.2) [WEB-1]. The comparison ("vs last month") is said in words beside it. |
| Navigation placement | Above a report, often in its Toolbar [WEB-7]. |
| Keyboard, pointer, trackpad | In the calendar, Shift with an arrow extends the selection, as the grid pattern's selection keys allow [WEB-4]. Escape closes it and focus returns to the field that opened it [WEB-6]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Presets, the comparison line and the calendar's look, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the active day as focused [WEB-8]. |
| Not confirmed | Native control: HTML date inputs, since the HTML standard is not in the registry. Keyboard, pointer, trackpad: a range picker key map, since no registry page sets one. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

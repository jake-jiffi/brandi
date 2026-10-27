# MultiSelect on the web

The multi-select picks several options, shown as removable tokens, built as a combobox over a multi-select listbox.

```yaml
component: MultiSelect
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
| Native control | A `combobox` controlling a `listbox` with `aria-multiselectable="true"` [WEB-8]. The APG patterns index lists Combobox and Listbox patterns [WEB-2]. Each chosen value is a token with a remove `button` [WEB-3]. |
| Target and spacing | Each remove button has a 24 CSS px hit area (2.5.8), and 40 CSS px on touch [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Tokens wrap onto new lines. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Token text 4.5:1 (1.4.3), and chosen options marked by a check as well as colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, with tokens, and open, with each option chosen or not. Every selectable option states `aria-selected` as true or false [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | As Combobox, with `aria-multiselectable="true"` on the listbox [WEB-8]. The tokens sit in a `list` before the input, each with a `button` named "Remove [value]" [WEB-3] [WEB-8]. Adding or removing a value is a status message (4.1.3) [WEB-1]. |
| Navigation placement | In a Field, for assignees, categories and people to invite [WEB-7]. |
| Keyboard, pointer, trackpad | The list follows Combobox [WEB-8]. Backspace in the empty input removes the last token. After a removal, focus moves to a logical element, never the page body [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The tokens' look and how many show before "and 3 more", inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the active option as focused while DOM focus stays in the input [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Combobox and Listbox key maps for several choices, since those pages are not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

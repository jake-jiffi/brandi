# DescriptionList on the web

The description list shows label and value pairs for a record's details, and its closest web semantics are ARIA terms and definitions.

```yaml
component: DescriptionList
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
| Native control | WAI-ARIA 1.2 has no role that pairs a label with a value. The closest are `term`, related concept HTML `dfn`, with `definition` [WEB-8], or a two-column table whose labels are row headers [WEB-5]. |
| Target and spacing | None. Any link in a value meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. It stacks by itself under 420 CSS px. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Labels in `text-subtle` and values in `text`, both 4.5:1 (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | A value, a badge or an empty value. A missing value says "Not set", never blank, so the pair still reads (1.3.1) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Each label is tied to its value in code, not only by position (1.3.1) [WEB-1]. With `term` and `definition`, the definition points at its term through `aria-labelledby` [WEB-8]. |
| Navigation placement | Record details and side panes [WEB-7]. |
| Keyboard, pointer, trackpad | None. Any link in a value is its own Tab stop (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | `columns` or `stacked`, the 420 CSS px threshold, and the label and value styles, inside the floors [WEB-1]. |
| Platform owns | The structure the chosen elements expose [WEB-8]. |
| Not confirmed | Native control: HTML `dl`, `dt` and `dd` and how browsers expose them, since neither the HTML standard nor HTML Accessibility API Mappings is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

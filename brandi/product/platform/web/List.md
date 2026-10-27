# List on the web

The list is a column of list rows for records, inboxes and queues, built on HTML list elements.

```yaml
component: List
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
| Native control | HTML `ol` or `ul`, the base concepts of the `list` role, with `li` items, the base concept of `listitem` [WEB-8]. |
| Target and spacing | Each row's link or button meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Dividers identify no control, so 1.4.11 asks nothing of them [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Loading, empty and error from the shared contract. While loading it carries `aria-busy="true"` [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `list` with `listitem` children [WEB-8]. `aria-setsize` and `aria-posinset` give each row's place when only part of the list is in the DOM [WEB-8]. |
| Navigation placement | Records on phones, inboxes, queues and the left pane of list and detail [WEB-7]. |
| Keyboard, pointer, trackpad | No key handling of its own. Each row's link or button is a Tab stop (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | `boxed` (on by default), `divided` and spacing, inside the floors [WEB-1]. |
| Platform owns | List semantics from `ol`, `ul` and `li` [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

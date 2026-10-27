# Pagination on the web

Pagination is the footer of a long table, with its range and previous and next, built from links in a `nav` landmark.

```yaml
component: Pagination
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
| Native control | An HTML `nav`, the related concept of the `navigation` role [WEB-8], holding HTML `a` links for previous and next, since the page lives in the URL and a link navigates [WEB-3]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Link text 4.5:1 (1.4.3) and any link boundary 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | "1 to 25 of 312", "No results" at zero, and no links when everything fits. ARIA advises against `aria-disabled` on elements the host language cannot disable, so an unavailable Previous is plain text, not a disabled link [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `nav` named "Pagination" when the page has other `nav` landmarks [WEB-7]. The range is plain text, and the new range after a page change is a status message (4.1.3) [WEB-1]. A numbered current page takes `aria-current="page"` [WEB-8]. |
| Navigation placement | The table's footer [WEB-7]. |
| Keyboard, pointer, trackpad | Tab reaches Previous and Next (2.1.1) [WEB-1]. When the link that had focus disappears on the last page, focus moves to a logical element [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The range's wording, keeping the page size the person chose, and the layout, inside the floors [WEB-1]. Filters and search come before deep paging. |
| Platform owns | The link role and how the browser follows it [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

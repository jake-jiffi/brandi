# Toolbar on the web

The toolbar is one row of search, filters and view controls above a table or list, built as a named ARIA toolbar.

```yaml
component: Toolbar
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
| Native control | Role `toolbar`, named by `label` ("[Record] filters"). ARIA requires the name when a page has more than one, and managing focus inside it is optional [WEB-8]. The APG patterns index lists a Toolbar pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. It wraps on narrow screens. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Each control keeps its own floors (1.4.3, 1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Filters, or bulk actions once rows are selected, with a selection bar that says how many. The swap is a status message (4.1.3) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `toolbar`, horizontal by default, named by `label` [WEB-8]. Each control keeps its own role. |
| Navigation placement | 12 CSS px above its table, as one block, sticking while the table scrolls. Search first, then filter chips, a Spacer, then the view switcher and secondary actions, with DOM order matching that visual order (1.3.2) [WEB-1]. |
| Keyboard, pointer, trackpad | Each control is its own Tab stop unless the toolbar manages focus inside it [WEB-8]. When the swap to bulk actions removes the control that had focus, focus moves to a logical element [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The order, the gap above the table and the sticky behaviour, inside the floors [WEB-1]. |
| Platform owns | Exposing the toolbar role and its name [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Toolbar key map, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

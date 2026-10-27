# AskBar on the web

The ask bar is search and ask in one field on Home, built on the HTML search input inside a `search` landmark.

```yaml
component: AskBar
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
| Native control | HTML `input[type="search"]`, the base concept of `searchbox` [WEB-8], inside the HTML `search` element, which maps to the `search` landmark [WEB-7]. Ask is an HTML `button` [WEB-3]. With suggestions, the field is a `combobox` [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text and placeholder 4.5:1 (1.4.3) and a 3:1 border (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, typing and asking. Its value is the typed text, which the native input exposes [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Named by a visible label or `aria-label`, since ARIA treats a placeholder as a hint, not a label [WEB-8]. Ask is a `button` named by `action` ("Ask") [WEB-3]. After Ask, focus moves to the new answer (2.4.3) [WEB-1]. |
| Navigation placement | One per product, on Home, in a `search` landmark [WEB-7]. Once there are answers, it shares one column with them, newest answer last. Everywhere else the rail's search or the CommandMenu does the job. |
| Keyboard, pointer, trackpad | Cmd or Ctrl K focuses the field, and a shortcut with a modifier is outside 2.1.4 [WEB-1]. In a single-line field Enter usually submits, as ARIA's `textbox` note records [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The placeholder, which says what can be found in the product's words, `action`, and the 880 CSS px column, inside the floors [WEB-1]. With no assistant, it renders nothing. |
| Platform owns | Editing, the caret and the value the native input exposes [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: whether the browser's own Cmd or Ctrl K binding reaches the page first, since no browser documentation is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

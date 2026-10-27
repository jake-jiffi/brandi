# SearchField on the web

The search field filters what is on screen as the person types, built on the HTML search input.

```yaml
component: SearchField
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | HTML `input[type="search"]`, the base concept of the `searchbox` role [WEB-8]. As a page's search, it sits in the HTML `search` element, which maps to the `search` landmark [WEB-7]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text and placeholder 4.5:1 (1.4.3) and a 3:1 border (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, filled, focus and disabled, through `:placeholder-shown`, `:focus-visible` and `:disabled` [WEB-10]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `searchbox` [WEB-8]. The product names it by its placeholder unless `aria-label` is set, but ARIA calls a placeholder a hint about the value, not a label [WEB-8]. So `aria-label` repeats the placeholder's words, which keeps the visible words in the name (2.5.3) [WEB-1]. The filtered count is a status message (4.1.3) [WEB-1]. |
| Navigation placement | First in the Toolbar, above what it filters. Searching everything is the AskBar's or the CommandMenu's job [WEB-7]. |
| Keyboard, pointer, trackpad | The `shortcut` key, such as "/", focuses it. 2.1.4 asks that a single-key shortcut can be turned off, and Root's `shortcuts` setting does that [WEB-1]. It never fires while someone types in another field. `aria-keyshortcuts` exposes it [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The placeholder's wording ("Search clients"), the shortcut key and the size [WEB-1]. The product lets the placeholder name the field, where ARIA asks for a label [WEB-8]. Setting `aria-label` to the same words meets both. |
| Platform owns | Editing, the caret and the value the native input exposes [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the browser's own clear button and whether Escape clears a search input, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

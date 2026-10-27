# FilterChip on the web

The filter chip is a filter over what is already on screen, pressed on and off, built as a toggle button.

```yaml
component: FilterChip
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
| Native control | HTML `button` with `aria-pressed`, the APG toggle button [WEB-3]. The web has no chip element. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The product sets 40 CSS px on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Pressed takes `selected-strong` and a check, so the state never rides on colour alone (1.4.1) [WEB-1]. The chip's edge is 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unpressed, pressed, hover, focus and disabled. `aria-pressed` is `true` or `false` [WEB-3]. Keyboard focus shows with `:focus-visible` [WEB-10]. It is always visible (2.4.7) and never fully hidden by author content (2.4.11) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `button` with `aria-pressed` [WEB-3]. The name is the filter's label with its count in words ("Overdue, 12 need you"), and it never changes when the pressed state does [WEB-3]. When the results change, the new count is a status message (4.1.3) [WEB-1]. |
| Navigation placement | One row in the Toolbar, above the list or table it filters, inside a named `group` such as "[Record] filters" [WEB-8]. |
| Keyboard, pointer, trackpad | Space and Enter toggle it [WEB-3]. Each chip is its own Tab stop unless the Toolbar manages focus inside it [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The pill, the check, the colours and the count's look, inside 3:1 and the not-by-colour-alone floor [WEB-1]. Chips are 40 CSS px on touch, an accepted choice above 2.5.8 (AA) and below the 44 that 2.5.5 (AAA) sets [WEB-1]. Only "needs you" counts take `attention`. Filters live in the URL. |
| Platform owns | Role, `aria-pressed` exposure, and Space and Enter activation [WEB-3]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

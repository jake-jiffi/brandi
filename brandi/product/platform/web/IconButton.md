# IconButton on the web

The icon button is an icon-only action, built on the HTML `button` element with a required label.

```yaml
component: IconButton
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
| Native control | HTML `button` element, the base concept of the `button` role [WEB-8]. It has no text content, so its name comes from `aria-label` or `aria-labelledby` [WEB-3]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The product's sizes match Button's, with 40 to 48 CSS px on touch. |
| Type | No visible text on the button. The tooltip's text follows the brand ramp and survives 200% resize (1.4.4) [WEB-1]. |
| Colour and theme | The icon is the only visible cue, so it needs 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus, active and disabled, as Button. `aria-disabled="true"` when the action is unavailable, and `aria-pressed` only on a toggle [WEB-3]. Keyboard focus shows with `:focus-visible` [WEB-10]. It is always visible (2.4.7) and never fully hidden by author content (2.4.11) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `button`, named by `label` ("More actions for [record]") [WEB-3]. The icon is hidden [WEB-8]. The tooltip shows the same words, so it names the button through `aria-labelledby`, or stays out of the tree, rather than repeating the name as a description [WEB-8]. |
| Navigation placement | Toolbars, card headers and dense rows: anywhere a known action needs no words, inside its container's landmark [WEB-7]. |
| Keyboard, pointer, trackpad | Space and Enter activate [WEB-3]. The tooltip shows on keyboard focus as well as hover (2.1.1), and once shown it follows 1.4.13 [WEB-1]. Pointer activation runs on the up-event, the No Down-Event option of 2.5.2 [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The icon, the variant (`ghost` by default) and the size, inside the target and 3:1 floors [WEB-1]. Only icons people know by sight: more, close, refresh, copy, previous and next. Anything less obvious is a text Button. |
| Platform owns | Role, name computation, Space and Enter activation [WEB-3]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

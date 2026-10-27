# FormActions on the web

The form actions row ends a form with Cancel and the one primary, built from HTML buttons.

```yaml
component: FormActions
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
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | A row of HTML `button` elements, the base concept of the `button` role [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Each button keeps Button's floors: label 4.5:1 (1.4.3) and fill 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Each button keeps Button's states, with `aria-disabled` when unavailable [WEB-3]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Each is a `button` named by its text [WEB-3]. The primary names the result ("Save billing"), never "Submit", and its name contains the visible words (2.5.3) [WEB-1]. |
| Navigation placement | The end of the form, right-aligned above a hairline, with a destructive action apart on the left. The web sets no order [WEB-6], so the product's applies. |
| Keyboard, pointer, trackpad | The DOM order matches the visual order: destructive, Cancel, then primary (2.4.3) [WEB-1]. Space and Enter activate [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | `align` (`end` by default, `start` for narrow forms), the hairline, the order and the variants, none of which the web sets [WEB-6]. Each button keeps its floors [WEB-1]. |
| Platform owns | Button roles and activation [WEB-3]. |
| Not confirmed | Keyboard, pointer, trackpad: whether Enter in a field submits the form through its primary, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

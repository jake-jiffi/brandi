# Checkbox on the web

The checkbox is a choice saved with a form, built on the HTML checkbox input.

```yaml
component: Checkbox
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | HTML `input[type="checkbox"]`, the related concept of the `checkbox` role [WEB-8]. The APG patterns index lists a Checkbox pattern [WEB-2]. |
| Target and spacing | An 18 CSS px box with a 24 CSS px hit area meets 2.5.8 [WEB-1]. The product sets 40 to 44 CSS px on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The box's edge and the check are 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unchecked, checked, indeterminate, disabled and focus. `aria-checked` is `true`, `false` or `mixed` [WEB-8]. `:checked`, `:indeterminate`, `:disabled` and `:focus-visible` select them, and an HTML checkbox matches `:indeterminate` while its indeterminate property is true [WEB-10]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `checkbox`, named by its label, with `aria-checked` [WEB-8]. Its children are presentational, so the drawn box adds nothing [WEB-8]. `description` is tied by `aria-describedby` [WEB-8]. The label states the outcome ("Email the [client] a copy") (2.4.6) [WEB-1]. |
| Navigation placement | In forms, saved with the form. A setting that applies at once is a Switch [WEB-8]. |
| Keyboard, pointer, trackpad | Reachable and operable from the keyboard (2.1.1) [WEB-1]. The key that toggles it: not confirmed. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Box size, hit area, the check's shape and the colours, inside the 3:1 and target floors [WEB-1]. |
| Platform owns | The native checked and indeterminate states and their exposure [WEB-10] [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the checkbox key map, since neither the APG Checkbox page nor the HTML standard is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

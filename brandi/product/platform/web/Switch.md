# Switch on the web

The switch is a setting that applies at once, and on the web it is an ARIA switch, since HTML has no switch element.

```yaml
component: Switch
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft), Vibration API (Candidate Recommendation Draft)
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
  - key: WEB-11
    url: https://www.w3.org/TR/vibration/
    marker: Candidate Recommendation Draft 2026-05-21
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No native switch. ARIA role `switch`, a kind of checkbox for on and off, whose related concept is `button` [WEB-8]. The APG patterns index lists a Switch pattern [WEB-2]. |
| Target and spacing | A 24 CSS px hit area meets 2.5.8 [WEB-1]. The product sets 44 CSS px on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Track and thumb are 3:1 against adjacent colours in both states, and the off track in `line-control` stays visible (1.4.11) [WEB-1]. On and off differ by more than colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | On, off, disabled and focus. `aria-checked` is `true` or `false`, and ARIA treats `mixed` as false on a switch [WEB-8]. Keyboard focus shows with `:focus-visible` [WEB-10]. It is always visible (2.4.7) and never fully hidden by author content (2.4.11) [WEB-1]. |
| Motion | The thumb slides. Under `prefers-reduced-motion` it fades instead [WEB-9]. |
| Accessibility API | Role `switch`, with the required `aria-checked`, named by its label [WEB-8]. Its children are presentational [WEB-8]. The label names the setting, never "On" or "Off" (2.4.6) [WEB-1]. |
| Navigation placement | Settings pages, where the switch sits before its label. A choice that needs a save is a Checkbox in a form [WEB-8]. |
| Keyboard, pointer, trackpad | Reachable and operable from the keyboard (2.1.1) [WEB-1]. The key that toggles it: not confirmed. Applying the setting changes content, not context (3.2.2) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. `navigator.vibrate()` runs only in Chromium-based browsers, and only once the person has interacted with the page. WebKit opposes the API and Firefox removed it in version 129 [WEB-11]. |
| Brand may change | Track, thumb, sizes and the place before the label, inside the 3:1 and target floors [WEB-1]. |
| Platform owns | Role mapping and the checked state's exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the switch key map, since the APG Switch page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

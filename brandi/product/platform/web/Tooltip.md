# Tooltip on the web

The tooltip is a short label shown on hover or keyboard focus, and on the web it is the ARIA tooltip role.

```yaml
component: Tooltip
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
| Native control | No native tooltip in the registry. Role `tooltip`, referenced from its trigger by `aria-describedby` before or as it shows [WEB-8]. The APG patterns index lists a Tooltip pattern [WEB-2]. |
| Target and spacing | The trigger meets 2.5.8 [WEB-1]. The tooltip is not a target. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. One short sentence at most. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Hidden, or shown on hover after a short delay or at once on focus. ARIA notes typical delays of one to five seconds [WEB-8]. `open` renders it for designs. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `tooltip`, named by its content, and the trigger's description through `aria-describedby` [WEB-8]. When it is the trigger's only label, as on IconButton, it names the trigger through `aria-labelledby` instead [WEB-8]. Never interactive. |
| Navigation placement | In a portal above everything, beside its trigger, shifting to stay on screen [WEB-8]. |
| Keyboard, pointer, trackpad | It shows on keyboard focus as well as hover (2.1.1) [WEB-1]. Escape dismisses it without moving focus or the pointer, the pointer can move onto it, and it stays until hover or focus leaves, which is what 1.4.13 asks [WEB-1]. A hidden tooltip never takes Escape. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Placement (`top`, `bottom`, `right`), delay, surface and radius, inside the floors [WEB-1]. Never the only home for essential information. A definition people need on touch is a toggletip. |
| Platform owns | Computing the trigger's description from `aria-describedby` [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Tooltip key map, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

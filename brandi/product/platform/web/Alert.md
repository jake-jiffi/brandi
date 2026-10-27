# Alert on the web

The alert is a message inside a page or card that says what happened, what it means and what to do, built on the ARIA alert and status roles.

```yaml
component: Alert
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
| Native control | No native alert element in the registry. Role `alert` for something that went wrong while the person was there, and role `status` otherwise [WEB-8]. The APG patterns index lists an Alert pattern [WEB-2]. |
| Target and spacing | Actions and the dismiss button meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1 on the tint (1.4.3) [WEB-1]. The tone also shows through the icon and the words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Tones `neutral`, `info`, `success`, `warning`, `danger` and `ai`, and dismissed. `danger` and `warning` default to `role="alert"`, the rest to `role="status"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | An `alert` is assertive and atomic, so it is read at once, and a `status` is polite and atomic [WEB-8]. A warning already there when the page loads takes `role="status"`, so it never interrupts on every visit. Both are status messages, exposed without focus (4.1.3) [WEB-1]. Dismiss is a `button` named "Dismiss: [title]" [WEB-3]. |
| Navigation placement | Inside the page or card it concerns [WEB-7]. |
| Keyboard, pointer, trackpad | It takes no focus, and ARIA asks that people never have to close an alert [WEB-8]. Actions and dismiss are Tab stops. After dismiss, focus moves to a logical element [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Tone tints, icons, the layout and the actions, inside the floors [WEB-1]. State, then consequence, then the fix. "Try again" is a Button, and a link appears only when it goes somewhere [WEB-3]. |
| Platform owns | When assistive tech speaks: an assertive region interrupts, a polite one waits [WEB-8]. |
| Not confirmed | Accessibility API: the APG Alert pattern's guidance, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

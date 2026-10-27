# Toggletip on the web

The toggletip is a short explanation behind an info button, opened by a press, a tap or Enter, built as a button with a polite status.

```yaml
component: Toggletip
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
| Native control | An HTML `button` [WEB-8] that shows a short message, announced through a polite `status` as it opens [WEB-8]. It is not a `tooltip`, which appears on hover or focus, not on a press [WEB-8]. The closest patterns in the APG index are Tooltip and Disclosure [WEB-2]. |
| Target and spacing | The info button meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. One or two sentences. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The info icon is 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open, with `aria-expanded` on the button [WEB-8]. Hover shows it after a short delay, 150 ms in the reference. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The button is named for what it explains ("More about [figure]") [WEB-3]. As it opens, the message is a status message read without moving focus (4.1.3) [WEB-1] [WEB-8]. |
| Navigation placement | Beside the label or figure it explains. Its message follows the button in reading order, even when drawn in a portal (1.3.2) [WEB-1]. |
| Keyboard, pointer, trackpad | A press, a tap or Enter opens it [WEB-3]. Escape or a press elsewhere closes it. Content that hover shows can be dismissed without moving the pointer or focus, stays while the pointer is over it, and persists until dismissed (1.4.13) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The icon, the delay and the panel's look, inside the floors [WEB-1]. Proven only as MetricCard's hint, so not yet proven as a component. |
| Platform owns | When assistive tech speaks the polite `status` [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

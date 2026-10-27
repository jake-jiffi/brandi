# ToastRegion on the web

The toast region is the queue that shows, times and pauses toasts, built on one polite status region.

```yaml
component: ToastRegion
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | One polite `status` region, in the page before any toast arrives [WEB-8]. |
| Target and spacing | Buttons in its toasts meet 2.5.8, and 40 to 44 CSS px on touch [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | As Toast: text 4.5:1 on `surface-inverse` (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, showing, paused while hovered or focused, and queued. Toasts show one at a time, and each arrival is a status message (4.1.3) [WEB-1]. |
| Motion | Toasts rise or fade in. Under `prefers-reduced-motion` they only fade [WEB-9]. |
| Accessibility API | The region is a `status`, polite and atomic, that never takes focus [WEB-8]. Each toast's sentence is written into it once. |
| Navigation placement | Fixed at the bottom centre, above the phone action bar, never hiding the focused control (2.4.11) [WEB-1]. |
| Keyboard, pointer, trackpad | Toasts pause while a button in them has focus. If a timer that removes an action counts as a time limit, 2.2.1 asks that people can turn it off, adjust it or extend it [WEB-1]. Letting people postpone or suppress interruptions is 2.2.4, AAA [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Timings (5 s, or 8 s with Undo), queue length and position, inside the floors [WEB-1]. Undo stays reachable after its toast goes, or people can hold toasts, so the timer never limits the action (2.2.1) [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | When assistive tech speaks the polite `status` [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: whether an auto-dismissing toast's action counts as a time limit under 2.2.1, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

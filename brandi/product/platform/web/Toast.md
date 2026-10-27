# Toast on the web

The toast is a brief confirmation after an action, at the bottom centre, with Undo when the action can be reversed, announced through a polite status.

```yaml
component: Toast
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Vibration API (Candidate Recommendation Draft)
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
  - key: WEB-11
    url: https://www.w3.org/TR/vibration/
    marker: Candidate Recommendation Draft 2026-05-21
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. A polite `status` region announces it [WEB-8], and Undo is an HTML `button`, the base concept of the `button` role [WEB-8]. |
| Target and spacing | Undo and the close button meet 24 × 24 CSS px (2.5.8) [WEB-1]. The reference's 46 by 24 CSS px Undo failed on touch, so the product sets 40 to 44 there. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. One sentence, past tense, with a full stop: "3 invoices sent." |
| Colour and theme | Text 4.5:1 on `surface-inverse` in both themes (1.4.3) [WEB-1]. The tone shows through an icon and the words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Shown, paused while hovered or focused, and gone. Tones `neutral`, `success`, `warning` and `danger`. It goes after 5 s, or 8 s with Undo, and its arrival is a status message (4.1.3) [WEB-1]. |
| Motion | It rises or fades in. Under `prefers-reduced-motion` it only fades [WEB-9]. |
| Accessibility API | Its sentence goes into a polite `status` that is already in the page and never takes focus [WEB-8]. Undo is a `button` named for what it undoes [WEB-3]. Errors that need action are Alerts, never toasts. |
| Navigation placement | Fixed at the bottom centre, above the phone action bar, never wider than the screen. It never hides the control that has focus (2.4.11) [WEB-1]. |
| Keyboard, pointer, trackpad | Undo is a Tab stop, and the toast pauses while it has focus. If removing Undo after 8 s counts as a time limit, 2.2.1 (Level A) asks that people can turn it off, adjust it or extend it [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. `navigator.vibrate()` runs only in Chromium-based browsers, and only once the person has interacted with the page. WebKit opposes the API and Firefox removed it in version 129 [WEB-11]. |
| Brand may change | Position, `surface-inverse`, the 5 s and 8 s timings and the copy, inside the floors [WEB-1]. Undo stays reachable after the toast goes, or people can hold toasts, so the timer never limits the action (2.2.1) [WEB-1]. The floor applies. |
| Platform owns | When assistive tech speaks a polite `status` [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: whether an auto-dismissing toast's action counts as a time limit under 2.2.1, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

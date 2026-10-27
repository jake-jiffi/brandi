# Banner on the web

The banner is a one-line alert across the top of the page's content, built on the ARIA status and alert roles.

```yaml
component: Banner
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
| Native control | Role `status` by default, since a banner is usually there on arrival, and `alert` when it appears because something broke [WEB-8]. It is not the `banner` landmark, which holds site-wide header content [WEB-7]. |
| Target and spacing | Actions and the dismiss button meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. It wraps rather than cutting text when space runs out. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1 on the tint (1.4.3), and the tone shows through the icon and the words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Sample data, read-only mode, a source that is down, and offline as a `neutral` banner. It stays while its state still applies, and its arrival is a status message (4.1.3) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `status` is polite and atomic, and an `alert` assertive and atomic [WEB-8]. A banner present on load takes `status`, so it never interrupts on every visit. Dismiss is a `button` named "Dismiss: [title]" [WEB-3]. |
| Navigation placement | One at a time, under the PageHeader, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | It takes no focus [WEB-8]. Actions and dismiss are Tab stops. After dismiss, focus moves to a logical element [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Tones, wording and the one-at-a-time rule, inside the floors [WEB-1]. Under a down source the last good data stays, marked with its time. Offline says changes will save when the connection is back. |
| Platform owns | When assistive tech speaks: an assertive region interrupts, a polite one waits [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

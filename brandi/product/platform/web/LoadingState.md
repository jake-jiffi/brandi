# LoadingState on the web

The loading state shows an area waiting on another system for more than a second, with what is happening, an indeterminate bar and the character, built on a polite status.

```yaml
component: LoadingState
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | None. A polite `status` holding the line, an indeterminate `progressbar` with no `aria-valuenow`, and `aria-busy="true"` on the area it fills [WEB-8]. |
| Target and spacing | None of its own. A way to leave, after ten seconds, meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The bar's fill is 3:1 against its track (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Nothing under a second. Then the line, naming the system and the work. Past ten seconds, how long it usually takes and a way to leave. The progressbar needs a name [WEB-8]. |
| Motion | The bar slows right down and the character's loop stops under `prefers-reduced-motion` [WEB-9]. 2.2.2 asks for a way to pause, stop or hide motion that runs past five seconds beside other content [WEB-1]. |
| Accessibility API | The `status` is polite and atomic and never takes focus, so the line is read out without moving anyone [WEB-8]. The words name the system and the work: "Pulling this week's [records] from [source]" (4.1.3) [WEB-1]. |
| Navigation placement | In place of the area that is loading [WEB-7]. |
| Keyboard, pointer, trackpad | None. It takes no focus [WEB-8]. A way to leave after ten seconds is a Tab stop (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The line's wording, the character and the bar's look, inside the floors [WEB-1]. "Loading" is a fallback, not copy. |
| Platform owns | When assistive tech speaks a polite `status` [WEB-8]. |
| Not confirmed | Motion: whether loading motion counts as essential under 2.2.2, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

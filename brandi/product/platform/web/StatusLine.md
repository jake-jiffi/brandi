# StatusLine on the web

The status line holds an answer's one live region, and Stop when there is no composer, built on the ARIA status role.

```yaml
component: StatusLine
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
| Native control | Role `status`, polite and atomic, in the page before anything changes and empty until something does [WEB-8]. |
| Target and spacing | Stop meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The timer uses tabular figures. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The grid and shimmer are decoration, hidden from the tree [WEB-8]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Working, a step changing, waiting for approval, done, stopped and failed, each with its own line: "Working. Step 1 of 3: finding the invoices", "Answer ready", "Stopped at step 2 of 3" (4.1.3) [WEB-1]. |
| Motion | Under `prefers-reduced-motion` the grid holds its dim frame and the timer keeps counting [WEB-9]. Stop ends the work and its motion, the kind of control 2.2.2 asks for [WEB-1]. |
| Accessibility API | One `status` per answer, written only on a change [WEB-8]. A repeat is cleared, then written again a moment later. Numbers and symbols go in as words ("step 2 of 3"). Spinners, shimmer and timers take `aria-hidden="true"` and sit outside the region [WEB-8]. |
| Navigation placement | At the end of the answer's work, holding Stop when there is no composer [WEB-7]. |
| Keyboard, pointer, trackpad | Stop is a `button` [WEB-3]. After Stop, focus moves to the "Stopped at step N of M" line, which takes `tabindex="-1"` [WEB-8]. The region itself never takes focus [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The grid's look, the timer and the line's wording, inside the floors [WEB-1]. A finished answer that loads shows its status as plain text outside the region. Not yet proven: no review round has checked it. |
| Platform owns | When assistive tech speaks the polite `status` [WEB-8]. |
| Not confirmed | Accessibility API: whether clearing and rewriting the line makes every screen reader repeat it, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

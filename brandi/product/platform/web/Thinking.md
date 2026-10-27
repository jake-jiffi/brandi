# Thinking on the web

Thinking is the assistant's working line, a small spinner then the work in words, built on a polite status.

```yaml
component: Thinking
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
| Native control | None. A line of text with a hidden spinner, inside a `status` when `live` is on [WEB-8]. |
| Target and spacing | None. It is never pressable [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. It names the work ("Reading 12 [records]"), never "Thinking…" alone once the work is known. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The spinner is 3:1 when it is the only visible cue (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Working. `live` is on by default and off inside AIAnswer and AIProposal, which own the one status line [WEB-8]. |
| Motion | The spinner slows under `prefers-reduced-motion` [WEB-9]. No pulsing dots: the words carry the status. |
| Accessibility API | With `live`, a polite, atomic `status` that never takes focus [WEB-8]. Inside an answer it is plain text, since the answer has one status line (4.1.3) [WEB-1]. The spinner takes `aria-hidden="true"` [WEB-8]. |
| Navigation placement | In the answer or proposal it belongs to, in the same shape as the AISteps summary line [WEB-7]. |
| Keyboard, pointer, trackpad | None. It never takes focus [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The line's look and wording, inside the floors [WEB-1]. |
| Platform owns | When assistive tech speaks a polite `status` [WEB-8]. |
| Not confirmed | Motion: whether the spinner counts as essential motion under 2.2.2, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

# AIAnswer on the web

The AI answer shows what the assistant made or is making, with the question, its steps, the answer, its sources, a status and the next move, built from headings, text, links and one polite status.

```yaml
component: AIAnswer
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
| Native control | None. A section headed by the question, a `heading` at level 3 by default [WEB-8]. It holds AISteps, the answer, Source links, a footer of buttons and one `status` line [WEB-8]. |
| Target and spacing | Footer buttons, suggestions and sources meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The question is shown in full. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The streaming caret stays visible under `forced-colors` [WEB-9]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Thinking, streaming, then "Drafted", "Answered", "Stopped" or "Failed". While it works, status, sources, suggestions and actions wait for the finished answer. Stop ends the work and keeps what was found. Where streaming counts as auto-updating content, Stop is the way to stop it that 2.2.2 asks for [WEB-1]. |
| Motion | The caret and the spinner follow `prefers-reduced-motion`: the spinner slows and nothing slides [WEB-9]. |
| Accessibility API | One `status` per answer, in the page before anything changes and empty until it speaks. It is polite and atomic [WEB-8]. It says when work starts, then the status and the answer's first sentence (4.1.3) [WEB-1]. An answer that loads finished stays quiet. The spinner and caret take `aria-hidden="true"` [WEB-8]. |
| Navigation placement | In the answers column with the AskBar, newest answer last, no wider than 880 CSS px [WEB-7]. |
| Keyboard, pointer, trackpad | After Send, focus moves to the new answer. After Stop it moves to the "Stopped at step N of M" line, and after Try again to the step being retried (2.4.3) [WEB-1]. An outcome that is not a control takes `tabindex="-1"` [WEB-8]. Suggestions are buttons [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The status words, the caveat line, up to three suggestions as quiet buttons and default-size footer buttons, inside the floors [WEB-1]. No model names, prompts, tokens or raw tool calls on screen. |
| Platform owns | When assistive tech speaks the polite `status` [WEB-8]. |
| Not confirmed | Accessibility API: how screen readers queue a repeated identical message after the line is cleared and rewritten, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

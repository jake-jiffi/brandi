# AskPanel on the web

The ask panel holds the assistant's thread, the empty state and the composer, built from answers in order and a composer form.

```yaml
component: AskPanel
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
| Native control | None. A column of AIAnswers, each with its own status line, then a composer: a multi-line `textbox` with a Send `button` [WEB-8] [WEB-3]. The thread itself is not a live region. |
| Target and spacing | Send, Stop and the suggestions meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, with a greeting, the composer and up to three suggestions, then replying, done, stopped and failed. Send becomes Stop while an answer runs. When unavailable, Send carries `aria-disabled="true"` [WEB-3]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The composer is a multi-line `textbox` named by its label [WEB-8] (3.3.2) [WEB-1]. While an @ or / menu is open, the field is a `combobox`, the menu a `listbox`, and the highlighted row its `aria-activedescendant` [WEB-8]. Header tabs, if kept, are a `tablist` [WEB-8]. |
| Navigation placement | A panel or a page. The composer comes after the thread in the tab order (2.4.3) [WEB-1]. |
| Keyboard, pointer, trackpad | Enter sends and Shift+Enter adds a line, which departs from the multi-line default that ARIA's `textbox` note records [WEB-8]. Enter during IME composition never sends. After Send, focus moves to the new answer, and after Stop to the stopped line (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The greeting, the suggestions and the panel's width, inside the floors [WEB-1]. Enter to send is the product's choice over the multi-line default [WEB-8]. No model picker. Not yet proven: no review round has checked it. |
| Platform owns | Editing and the caret in the composer [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: IME composition events, since UI Events is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

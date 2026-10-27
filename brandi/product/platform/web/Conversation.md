# Conversation on the web

The conversation shows messages between people with a composer, for support, comments and messaging, built on the ARIA log role.

```yaml
component: Conversation
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
| Native control | Role `log` for the thread: new messages are added only at the end, and it is polite by default [WEB-8]. ARIA 1.3, a Working Draft, adds a `comment` role [WEB-8]. The composer is a multi-line `textbox`, related concept HTML `textarea` [WEB-8]. |
| Target and spacing | Send and message actions meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The assistant's messages carry the `ai` tone and say so in words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unread, read, sending, sent and failed. An unread message shows a dot and says "(unread)" to screen readers (1.4.1) [WEB-1]. |
| Motion | New messages appear in place. Under `prefers-reduced-motion` nothing slides [WEB-9]. |
| Accessibility API | A `log` named for the thread [WEB-8]. Each message names who sent it and when, with a `time` [WEB-8]. A new message is announced politely, once (4.1.3) [WEB-1]. The composer's label says what the text is for (3.3.2) [WEB-1]. |
| Navigation placement | Page content or a side pane, with the composer after the thread [WEB-7]. |
| Keyboard, pointer, trackpad | Enter inserts a line break in a multi-line field by default [WEB-8]. Send is a `button` [WEB-3]. Tab moves from the thread's controls to the composer (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Bubble or line layout and grouping by sender and day, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Announcing additions to a `log` politely [WEB-8]. |
| Not confirmed | Accessibility API: whether to use ARIA 1.3's `comment` role before it reaches Recommendation, which no registry page settles. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

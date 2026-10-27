# NotificationCentre on the web

The notification centre lists the events for the signed-in person, opened from the header or the rail, built as a button that opens a non-modal dialog holding a list.

```yaml
component: NotificationCentre
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
| Native control | A `button` with `aria-haspopup="dialog"` and `aria-expanded`, opening a non-modal `dialog` that holds a `list` of events [WEB-8]. No APG pattern covers it, and the closest in the index is Disclosure [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | A highlighted count waits on the reader and a grey one on others, and both are said in words (1.4.1). Count text is 4.5:1 (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open, with counts, and zero shows nothing. Unread events carry a dot and the hidden words "(unread)" (1.4.1) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The button's name carries the count in words ("Notifications, 3 need you") [WEB-8]. The panel is a `dialog` named "Notifications" [WEB-8]. Each line names who did what, and the assistant's lines say so in words as well as the `ai` tone (1.4.1) [WEB-1]. A new event while it is open is a status message (4.1.3) [WEB-1]. |
| Navigation placement | Opened from the header or the rail. The trigger's `aria-controls` points at the panel in its portal [WEB-8]. |
| Keyboard, pointer, trackpad | Space or Enter opens it [WEB-3]. Escape closes it and focus returns to the trigger. Tab moves through its events and actions (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The panel's size and grouping by day, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Exposing the dialog and the list [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

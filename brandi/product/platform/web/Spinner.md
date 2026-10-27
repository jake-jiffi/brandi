# Spinner on the web

The spinner is a small inline busy mark for a button or a cell, and the web has no spinner element in the registry.

```yaml
component: Spinner
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
| Native control | None in the registry. The busy area takes `aria-busy="true"` [WEB-8]. The mark is hidden, and the words beside it or a `status` carry the state [WEB-8]. |
| Target and spacing | None. A spinner is not a target [WEB-1]. |
| Type | No visible text of its own. The words beside it carry the state (1.1.1) [WEB-1]. |
| Colour and theme | When the mark is the only visible cue, it is 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Spinning. One spinner at a time in any one place, while its area carries `aria-busy="true"` [WEB-8]. |
| Motion | Under `prefers-reduced-motion` it slows to 2.4 s a turn rather than stopping, an accepted choice [WEB-9]. 2.2.2 asks for a way to pause, stop or hide motion that runs past five seconds beside other content [WEB-1]. A wait that long belongs to a LoadingState with words. |
| Accessibility API | With a `label` ("Loading" by default), the words sit in a `status`, polite and atomic [WEB-8]. With `label={null}`, the mark takes `aria-hidden="true"` and the words beside it speak [WEB-8]. |
| Navigation placement | Inline, in a busy button or table cell [WEB-8]. |
| Keyboard, pointer, trackpad | None. A `status` never takes focus when it changes [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Size, stroke, colour and the 2.4 s reduced-motion speed [WEB-9]. Content that is loading takes a Skeleton, and an area waiting on another system a LoadingState [WEB-1]. |
| Platform owns | When assistive tech speaks a polite `status` [WEB-8]. The forced colours palette, which the user agent supplies [WEB-9]. |
| Not confirmed | Motion: whether a loading spinner counts as essential motion under 2.2.2, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

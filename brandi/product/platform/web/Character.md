# Character on the web

The brand character or illustration is a decorative picture that marks a state, and no web control matches it.

```yaml
component: Character
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
| Native control | None. A decorative image: pure decoration needs no text alternative (1.1.1) [WEB-1], and `aria-hidden="true"` takes it out of the tree [WEB-8]. |
| Target and spacing | None. It is never pressable, so 2.5.8 asks nothing of it [WEB-1]. |
| Type | None. It carries no text. The words beside it carry the meaning (1.1.1) [WEB-1]. |
| Colour and theme | Never recoloured. While it is decorative, 1.4.11 sets no contrast for it, since that criterion covers only graphics needed to understand the content [WEB-1]. `prefers-contrast` and `forced-colors` report the person's settings [WEB-9]. |
| States | Poses, not interactive states: welcome, working, done, all caught up, needs a person, nothing found and help. It never appears on a form error, where words describe what went wrong (3.3.1) [WEB-1]. |
| Motion | The working and calm loop stops under `prefers-reduced-motion` [WEB-9]. 2.2.2 (Level A) asks for a way to pause, stop or hide motion that starts by itself, runs past five seconds and sits beside other content [WEB-1]. A loop that outlives five seconds needs that control for people without the setting. |
| Accessibility API | Hidden with `aria-hidden="true"` [WEB-8], or an image with an empty text alternative, since it is pure decoration (1.1.1) [WEB-1]. A `label` is only for a pose whose meaning the words beside it do not carry. |
| Navigation placement | One per screen, only in empty, loading, done, error, welcome and help moments, inside the landmark of the state it marks [WEB-7]. Never in tables, forms or a busy dashboard. |
| Keyboard, pointer, trackpad | None. It has no function to operate, so 2.1.1 asks nothing of it [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Poses, the 2D `flat` rendition, size and the gentle loop. The loop runs until reduced motion stops it, and 2.2.2 still asks for a pause, stop or hide control past five seconds [WEB-1]. The floor applies. Never recoloured, flipped, rotated, cropped or squashed. |
| Platform owns | `prefers-reduced-motion`, which comes from the person's settings [WEB-9]. Removing `aria-hidden="true"` content from the tree [WEB-8]. |
| Not confirmed | Motion: whether a loop that marks a working state counts as essential under 2.2.2, since the Understanding document is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

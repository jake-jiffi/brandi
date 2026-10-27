# Popover on the web

The popover is a non-modal panel anchored to a control, for a definition, a quick filter or a short edit, built as a non-modal ARIA dialog.

```yaml
component: Popover
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
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | A `dialog` without `aria-modal`, opened by a `button` with `aria-haspopup="dialog"` and `aria-expanded` [WEB-8]. APG's patterns index lists no popover pattern [WEB-2], and its Dialog pattern covers only the modal case [WEB-6]. |
| Target and spacing | The trigger and any control inside meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open. `aria-expanded` on the trigger gives the state [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `dialog` named by its title or after its trigger, since ARIA requires a name [WEB-8]. Unlike a modal dialog, the content outside stays available [WEB-6]. |
| Navigation placement | In a portal, anchored to its trigger and flipping to stay on screen. The trigger's `aria-controls` points at it, since the portal moves it away in the DOM [WEB-8]. |
| Keyboard, pointer, trackpad | A press, a tap or Enter opens it. Escape or a press elsewhere closes it, and focus returns to the trigger. Tab is not held inside, as it would be in a modal dialog [WEB-6]. Its place in the focus order follows its trigger, even from a portal (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Placement, size and whether hover opens it, inside the floors [WEB-1]. Content that hover opens follows 1.4.13 [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Exposing the dialog role and its name [WEB-8]. |
| Not confirmed | Native control: the HTML `popover` attribute, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

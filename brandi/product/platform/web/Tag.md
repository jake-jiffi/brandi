# Tag on the web

The tag is a category someone assigned, an outlined label with a colour dot, and the web has no tag element.

```yaml
component: Tag
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None for the tag, which is text [WEB-8]. `onRemove` adds an HTML `button`, the base concept of the `button` role [WEB-8]. |
| Target and spacing | The remove button has a 24 CSS px hit area (2.5.8) [WEB-1]. The product sets 40 CSS px on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Label text 4.5:1 (1.4.3) [WEB-1]. The label names the category, so the dot is never the only cue (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Static, or removable. The remove button has rest, hover, focus and active states [WEB-10]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Plain text. The remove button is a `button` named "Remove [tag]" [WEB-3], with its icon hidden [WEB-8]. After removal, focus moves to a logical element, never the page body [WEB-8]. |
| Navigation placement | In table cells, records and filters [WEB-7]. |
| Keyboard, pointer, trackpad | The remove button: Tab, then Space or Enter [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The category colours, one per chart series slot, the outline and any `tag-N` tints, kept apart from Badge's status tints, inside the floors [WEB-1]. |
| Platform owns | Space and Enter activation on the remove button [WEB-3]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

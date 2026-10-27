# Badge on the web

The badge is one or two words of state on a record, read and never pressed, and the web has no badge element.

```yaml
component: Badge
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
| Native control | None. Text in a `generic` container, which has no meaning of its own [WEB-8]. |
| Target and spacing | None. A badge is never a target [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Sentence case, no full stop. |
| Colour and theme | Text 4.5:1 on its tint (1.4.3) [WEB-1]. The word carries the meaning, so the tone's colour is never the only cue (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Tones, not states: `success`, `warning`, `danger`, `info`, `ai`, `highlight` and `neutral`. The same state has the same word everywhere, as 3.2.4 asks of components with the same function [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Plain text in reading order, read where it sits (1.3.2) [WEB-1]. The `dot` and any icon are hidden [WEB-8]. A cut label keeps its full text reachable without a mouse (2.1.1) [WEB-1]. |
| Navigation placement | On records: rows, page headers and cards [WEB-7]. |
| Keyboard, pointer, trackpad | None. A badge never takes focus. When its label is cut, the full text still reaches keyboard users some other way (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Tone tints, the small radius, `dot`, icons and size, inside 4.5:1 and the not-by-colour-alone floor [WEB-1]. Never the pressable shape. |
| Platform owns | Exposing the text to the tree [WEB-8]. |
| Not confirmed | Type: whether a label cut by CSS keeps its full text in the tree, since CSS Overflow was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

# AIDraftedMarker on the web

The AI-drafted marker is one line on a draft that says who asked for it and how the brand check went, built as plain text tied to the draft as its description.

```yaml
component: AIDraftedMarker
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
| Native control | None. Plain text tied to the item as its description through `aria-describedby` [WEB-8]. The issues link is an HTML `a` [WEB-8]. |
| Target and spacing | The issues link meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The check's result is in words, never colour alone (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Passed, issues, checking, not checked and edited, each a full sentence ("Drafted with AI by [name], brand check passed"). It is not a live region, so a change of state is not announced [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Plain text, and the draft's description through `aria-describedby` [WEB-8]. The issues link names what it opens ("2 brand issues") (2.4.4) [WEB-1]. |
| Navigation placement | On the draft itself, beside its title or its actions [WEB-7]. |
| Keyboard, pointer, trackpad | The issues link is focusable and nothing else is (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Wording and placement, inside the floors [WEB-1]. An auto-draft names what started it in place of a person. Not yet proven: no review round has checked it. |
| Platform owns | Computing the draft's description from `aria-describedby` [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

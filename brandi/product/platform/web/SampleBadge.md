# SampleBadge on the web

The sample badge marks a screen or card that shows sample data, and it is plain text on the web.

```yaml
component: SampleBadge
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
| Native control | None. Text beside the page title, in a `generic` container [WEB-8]. |
| Target and spacing | None. It is never a target [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1 on its tint (1.4.3), and the words carry the meaning (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Present until the real connection is live. It covers every figure on the screen, and invented names go in [brackets] (1.3.1) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Plain text "Sample data", read after the title in DOM order (1.3.2) [WEB-1]. Inside the `h1` it becomes part of the heading's name [WEB-8], so it sits beside the heading instead. |
| Navigation placement | Beside the page title in the PageHeader's `meta`, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | None. It never takes focus (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The badge's look and wording, inside 4.5:1 [WEB-1]. |
| Platform owns | Exposing the text to the tree [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

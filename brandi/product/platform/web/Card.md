# Card on the web

The card is the container on the canvas, with a title, an optional description and actions, a body and a footer, and the web has no card element.

```yaml
component: Card
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. A container with a heading at `headingLevel` [WEB-8]. With `href`, the title is an HTML `a`, the related concept of the `link` role [WEB-8]. |
| Target and spacing | With `href`, the title's link covers the card. Buttons inside stay separate targets, each meeting 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The title says what the card shows (2.4.6) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. An `interactive` or `selected` card shows its state at 3:1 (1.4.11), and `selected` by more than colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover (a lift when `interactive`), focus on the title link, and `selected`. `:focus-within` can mark the card while its link has focus [WEB-10]. |
| Motion | The hover lift stops under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | The title is a `heading`, 2 by default [WEB-8]. With `href`, the link's name is the title alone [WEB-8]. `aria-selected` is for cells, options, rows, tabs and tree items, not cards, so a selected card in a list takes `aria-current` [WEB-8]. |
| Navigation placement | On the page canvas, never inside another card [WEB-7]. A card that needs tabs is a page. |
| Keyboard, pointer, trackpad | With `href`, Tab reaches the title's link, then each button inside, in order (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Padding, radius, shadow, `flat`, `flush` and the hover lift, inside the floors [WEB-1]. No small uppercase label above the title. |
| Platform owns | Exposing the heading and the link [WEB-8]. |
| Not confirmed | Target and spacing: stretching a link over the whole card with CSS, since no registry page covers the technique. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

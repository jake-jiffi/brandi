# Root on the web

Root is the wrapper that sets the theme, the base type and the single-key shortcut setting for everything inside it, and no web control matches it.

```yaml
component: Root
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
| Native control | None. Root is not a control. It maps to the `generic` role of an HTML `div`, which has no meaning of its own and takes no name [WEB-8]. |
| Target and spacing | None. Root draws no target of its own, and every target inside it meets 2.5.8 [WEB-1]. |
| Type | Root sets the body face and base size from the brand ramp, since the web has no platform font. Text inside survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Root sets the text, background and selection colours for its theme. Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. `prefers-color-scheme` reports light when the person has stated no preference [WEB-9]. |
| States | No interactive states. It holds two settings: `theme`, light by default or dark, and `shortcuts`, which turns off single-key shortcuts inside it (2.1.4) [WEB-1]. |
| Motion | Under `prefers-reduced-motion` the product-wide rule applies: state changes still fade, and nothing slides, lifts or loops [WEB-9]. |
| Accessibility API | No role and no name, since a `generic` container has no meaning of its own [WEB-8]. The document's language is set where it can be programmatically determined (3.1.1) [WEB-1]. |
| Navigation placement | The outermost wrapper of every app, preview and artboard. A nested Root may flip one region's theme and nothing more. Every landmark sits inside it [WEB-7]. |
| Keyboard, pointer, trackpad | Single-key shortcuts inside obey `shortcuts`. 2.1.4 asks that a shortcut made only of letter, number, punctuation or symbol keys can be turned off, remapped, or work only on focus [WEB-1]. Cmd and Ctrl shortcuts stay on, since 2.1.4 does not cover them. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The body face, base size, text and selection colours, quiet scrollbars, font smoothing and `font-synthesis: none`, inside the contrast (1.4.3), resize (1.4.4) and spacing (1.4.12) floors [WEB-1]. Light is the default and dark is a whole theme people choose. Following `prefers-color-scheme` on a first visit is not a product rule [WEB-9]. |
| Platform owns | The `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion` and `forced-colors` values, which come from the person's settings [WEB-9]. The forced colours palette, which the user agent supplies [WEB-9]. |
| Not confirmed | Brand may change: whether browsers honour quiet scrollbars, font smoothing and `font-synthesis: none`, since CSS Scrollbars and CSS Fonts were not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

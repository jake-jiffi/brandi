# Logo on the web

The logo is the brand's mark from its master artwork, shown as an image, and the web has no logo control.

```yaml
component: Logo
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
| Native control | None. The mark is an image, and HTML `img` is the related concept of the `img` role [WEB-8]. It is never set in type and never redrawn. |
| Target and spacing | None of its own. When it sits inside a link, that link meets 2.5.8 [WEB-1]. |
| Type | Not live text. Logotypes count as essential under 1.4.5, so the brand's name may stay an image of text [WEB-1]. |
| Colour and theme | Text that is part of a logo or brand name has no contrast requirement (1.4.3) [WEB-1]. `color="auto"` picks the approved rendition for the theme it sits in. Under `forced-colors` the logo takes `currentColor` from its parent [WEB-9]. |
| States | None. A logo has no states. Inside a link it shows the link's focus indicator (2.4.7) [WEB-1]. |
| Motion | None. The logo system bans effects, and anything that did move would follow `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `img`, named by `title`, the brand name, through `aria-label` or `aria-labelledby`, as ARIA requires [WEB-8]. With `title=""` inside a link that already names it, it takes `aria-hidden="true"` so the name is not read twice [WEB-8]. |
| Navigation placement | The rail lockup and sign-in, never repeated in page headers. In the rail it sits inside the `nav` landmark named "Main" [WEB-7]. |
| Keyboard, pointer, trackpad | None of its own. Inside a link, the keyboard reaches the link (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Everything about the mark: renditions, clear space, minimum height and the tight viewBox, all from the logo system. WCAG exempts logotypes from contrast (1.4.3) and from the images of text rule (1.4.5) [WEB-1]. Never stretched, rotated or recoloured outside its renditions. |
| Platform owns | How the browser exposes the image and its name to the tree [WEB-8]. The forced colours palette, which the user agent supplies [WEB-9]. |
| Not confirmed | Accessibility API: how browsers expose inline SVG, since SVG Accessibility API Mappings was not read. Colour and theme: whether an SVG keeps its own fill under forced colours, and the system colour keywords that mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

# Avatar on the web

The avatar shows a person as a photo or initials on a tinted circle, and the web has no avatar control.

```yaml
component: Avatar
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
| Native control | None. A photo is an image, and HTML `img` is the related concept of the `img` role [WEB-8]. Initials are text. |
| Target and spacing | None. An avatar is not a target. When it opens a menu, the button around it meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Sizes run 24, 28, 32 and 40 CSS px. |
| Colour and theme | Initials 4.5:1 on their tint (1.4.3) [WEB-1]. The status dot shows by more than colour (1.4.1) and is 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Status `online`, `away` or `offline`, each shown by more than colour (1.4.1) [WEB-1]. No interactive states. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Standing alone, role `img` named "[Name], online" [WEB-8]. Beside the person's name it is hidden with `aria-hidden="true"`, and the status joins that text so it is still read (1.1.1) [WEB-1] [WEB-8]. |
| Navigation placement | Always beside the person's name: rows, comments, records and the rail's account button [WEB-7]. |
| Keyboard, pointer, trackpad | None. It never takes focus. The keyboard reaches the control around it (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The circle, the sizes, the tints, the dot's look and the assistant's own avatar, inside the contrast floors [WEB-1]. |
| Platform owns | How the browser exposes the image's text alternative [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

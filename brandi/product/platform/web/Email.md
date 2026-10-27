# Email on the web

The email kit is the product's transactional emails, with the lockup, a heading, the body, a button and the footer, written as HTML email for mail clients rather than a browser.

```yaml
component: Email
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
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
| Native control | Not a browser control: HTML email read in mail clients. Layout tables carry no table meaning, so they take the `presentation` role [WEB-8]. The button is a link, since it navigates [WEB-3]. |
| Target and spacing | The button link is at least 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Every email carries a plain-text part too. |
| Colour and theme | Text 4.5:1 (1.4.3) [WEB-1]. `prefers-color-scheme` reports light or dark where a client supports it [WEB-9], and each email is checked in light and dark mail apps. |
| States | None. An email is static, and its button link keeps 3:1 against the background (1.4.11) [WEB-1]. |
| Motion | None. Emails carry no motion, so `prefers-reduced-motion` has nothing to change [WEB-9]. |
| Accessibility API | One `h1` [WEB-8], the language set (3.1.1), and text alternatives on images (1.1.1) [WEB-1]. Layout tables are `presentation` [WEB-8]. The lockup's name is "[Brand] [product]". |
| Navigation placement | The lockup at the top, then the heading, body, one primary action and the footer, in a reading order that matches the layout (1.3.2) [WEB-1]. |
| Keyboard, pointer, trackpad | Every link is reachable from the keyboard in the client (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The lockup, colours, type, the one primary action labelled verb first, and the footer's wording, inside the floors [WEB-1]. Inline styles and table layout for mail clients. Not yet proven: no review round has checked it. |
| Platform owns | Not confirmed. Each mail client decides which HTML, CSS and media features it honours, and no registry page covers mail clients. |
| Not confirmed | Platform owns: mail client support for HTML, CSS, ARIA and `prefers-color-scheme`, since no registry page covers mail clients. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

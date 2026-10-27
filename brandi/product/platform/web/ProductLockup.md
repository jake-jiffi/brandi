# ProductLockup on the web

The product lockup is the brand mark with the product's name, one link when it has an `href`, and no web control matches it.

```yaml
component: ProductLockup
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
| Native control | An HTML `a` when `href` is set, the related concept of the `link` role [WEB-8]. Without `href` it is an image and text with no role of their own. |
| Target and spacing | As a link, at least 24 × 24 CSS px (2.5.8) [WEB-1]. The whole lockup is the target. |
| Type | The product's name is live text, set by the brand-to-product decision. It survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. A long name is cut with an ellipsis rather than widening the rail. |
| Colour and theme | Text that is part of a logo or brand name has no contrast requirement (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | As a link: rest, hover, focus and active, each with its own selector [WEB-10]. Keyboard focus shows with `:focus-visible` [WEB-10]. It is always visible (2.4.7) and never fully hidden by author content (2.4.11) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | One `link` named "[Brand] [product]", from its content or author [WEB-8]. The mark inside is hidden so the name is not doubled [WEB-8]. The link's text says where it goes (2.4.4) [WEB-1]. |
| Navigation placement | Top left, once per screen: the top of the rail inside the `nav` landmark, sign-in, and product emails [WEB-7]. Under 1024 CSS px it sits in the top bar beside the menu button. |
| Keyboard, pointer, trackpad | Reached with Tab and operable from the keyboard (2.1.1) [WEB-1]. It navigates, so it is a link and never a button [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Layout (`inline` with a hairline, or `stacked`), height and how the name is set, inside the resize and spacing floors [WEB-1]. The name is never larger than the mark. |
| Platform owns | The link role, its name computation and how the browser follows it [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Type: whether a name cut by CSS keeps its full text in the accessible name, since CSS Overflow was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

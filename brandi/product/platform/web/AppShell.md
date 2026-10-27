# AppShell on the web

The app shell is the frame of every product, with a skip link, the rail and the main column, built from HTML landmarks.

```yaml
component: AppShell
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
```

| Field | Spec |
|---|---|
| Native control | No native shell. Landmarks: HTML `nav` for the rail, and HTML `main`, one a page, for the content [WEB-7]. A skip link comes first and targets `main` (2.4.1) [WEB-1]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. Under 640 CSS px controls take their touch sizes. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Rail text 4.5:1 (1.4.3), and the selected and focus cues 3:1 on the rail (1.4.11) [WEB-1]. Dark needs values of its own, since the reference's dark rail sat at 1.05:1 on the canvas. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | The full rail from 1280 CSS px, icons with tooltips from 1024 to 1279, a drawer under 1024, and one column under 640. The drawer is open or closed, and its menu button carries `aria-expanded` [WEB-8]. |
| Motion | The drawer slides. Under `prefers-reduced-motion` it fades instead [WEB-9]. |
| Accessibility API | `main` (`<main id="main" tabindex="-1">`) and the rail's `nav`, named "Main" [WEB-7]. The skip link is the first focusable element (2.4.1) [WEB-1]. The open drawer follows the modal dialog pattern: the page behind is inert and focus stays inside [WEB-6]. |
| Navigation placement | The frame of every page: the rail on the leading edge and `main` beside it. Under 1024 CSS px a top bar holds the menu button and the lockup. Repeated navigation keeps its order from page to page (3.2.3) [WEB-1]. |
| Keyboard, pointer, trackpad | "Skip to content" comes first and targets `main` (2.4.1) [WEB-1]. In the drawer, Close navigation sits first, Escape and the scrim close it, and focus returns to the menu button [WEB-6]. Scroll padding keeps focus clear of the phone action bar (2.4.11) [WEB-1]. After a client navigation, focus moves to `main`. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The 1280, 1024 and 640 CSS px thresholds, measured on the shell itself, the rail's look, and whether the rail carries the brand, inside the floors [WEB-1]. |
| Platform owns | Landmark navigation, which screen readers offer from the landmarks [WEB-7]. The page title in the browser tab (2.4.2) [WEB-1]. |
| Not confirmed | Brand may change: container queries, since no CSS specification that defines them is in the registry. Accessibility API: the HTML `inert` attribute, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

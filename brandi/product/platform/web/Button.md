# Button on the web

The button is the pressable action, built on the HTML `button` element.

```yaml
component: Button
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
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | HTML `button` element, the base concept of the `button` role [WEB-8]. Standard HTML controls meet Name, Role, Value (4.1.2) when used to spec [WEB-1]. With `href` it renders a link, since a link navigates and a button acts [WEB-3]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | Brand type ramp. The label survives 200% text resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Label 4.5:1 against the fill, or 3:1 for large text (1.4.3). Fill 3:1 against adjacent colours (1.4.11) [WEB-1]. Dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus, active, disabled and loading. Show keyboard focus with `:focus-visible` [WEB-10]. Set `aria-disabled="true"` when the action is unavailable [WEB-3]. Inactive components are exempt from 1.4.11 [WEB-1]. Loading keeps the width, sets `aria-busy` and `aria-disabled`, ignores further presses and stays focusable [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `button`. Name from the text content, or from `aria-labelledby` or `aria-label`. Description through `aria-describedby`. `aria-pressed` only on toggle buttons [WEB-3]. The name contains the visible label text (2.5.3) [WEB-1]. While loading, the label says what is happening ("Saving…") and the spinner is hidden [WEB-8]. |
| Navigation placement | Page content. A button acts and a link navigates, and the role must match the function [WEB-3]. Secondary then primary, right-aligned, with Cancel immediately left of the primary. The web sets no order of its own [WEB-6]. |
| Keyboard, pointer, trackpad | Reachable by keyboard (2.1.1) [WEB-1]. Space and Enter activate. A button that opens a dialog moves focus into it, and focus returns to the button when the dialog closes [WEB-3]. Activation runs on the pointer's up-event, the No Down-Event option of 2.5.2 [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Fill, label colour, type, shape, padding and focus ring style, inside the contrast, focus and target floors [WEB-1]. The product sets the variants (`primary`, `secondary`, `ghost`, `brand`, `danger`, `danger-solid`, `link`), the pill, and 32, 36 and 44 CSS px heights (40, 44 and 48 on touch). With `href` it looks like a button but is a link, where APG asks that appearance match the function [WEB-3]. The role follows the function. |
| Platform owns | Role, name computation, Space and Enter activation, focus movement [WEB-3]. |
| Not confirmed | Keyboard, pointer, trackpad: how a native `disabled` button handles focus and events, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

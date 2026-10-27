# WorkspaceSwitcher on the web

The workspace switcher chooses the account, workspace or client someone is working in, built as a menu button with radio items.

```yaml
component: WorkspaceSwitcher
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-2
    url: https://www.w3.org/WAI/ARIA/apg/
    marker: APG 1.2, undated
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
```

| Field | Spec |
|---|---|
| Native control | A `button` with `aria-haspopup="menu"` opening a `menu` of `menuitemradio` items, the current one with `aria-checked="true"` [WEB-3] [WEB-8]. The APG patterns index lists a Menu Button pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The current workspace shows by a check as well as colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open, with the current workspace checked. The button carries `aria-expanded` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | It opens from the account button, named "[name], [role], account menu" [WEB-3]. Items are `menuitemradio` with `aria-checked` [WEB-8]. After a switch, where the person is now is a status message (4.1.3), and the page title changes (2.4.2) [WEB-1]. |
| Navigation placement | From the account button at the foot of the rail, inside its `nav` [WEB-7]. |
| Keyboard, pointer, trackpad | ARIA requires a menu to manage focus: the arrows move inside it and Tab leaves it [WEB-8]. Escape closes it and focus returns to the trigger. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Item layout and a mark for each workspace, inside the floors [WEB-1]. The current workspace shows on every screen. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the item in hand as focused [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Menu and Menu Button key maps, since those pages are not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

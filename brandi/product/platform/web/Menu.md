# Menu on the web

The menu offers actions on one thing, opened from an overflow button or any trigger, built as an ARIA menu behind a menu button.

```yaml
component: Menu
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
| Native control | No native menu control in the registry. Role `menu` owning `menuitem`, `menuitemcheckbox` and `menuitemradio`, opened by a `button` with `aria-haspopup="menu"` [WEB-3] [WEB-8]. The APG patterns index lists Menu and Menubar and Menu Button patterns [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. Each item clears 24 CSS px too. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The item in hand takes the hover wash and a visible edge, with a 2px ring from the keyboard, since a tint alone fails 1.4.11 [WEB-1]. Destructive items are in danger text and say so in words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open, and the item in hand, checked, disabled and danger. The trigger carries `aria-expanded` while open [WEB-8]. Checked items are `menuitemcheckbox` with `aria-checked`, and disabled items keep `aria-disabled="true"` and stay visible [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The trigger is a `button` with `aria-haspopup="menu"` and `aria-expanded`, named by `label` ("More actions for [record]") [WEB-3] [WEB-8]. The `menu` is vertical by default and named after its trigger [WEB-8]. Items are `menuitem`, each named, with `aria-keyshortcuts` for an item's shortcut. Separators are `separator` and groups are `group` [WEB-8]. |
| Navigation placement | Opens in a portal above everything, never clipped by a table or card, and flips to stay on screen. The trigger's `aria-controls` points at it, since the portal moves it away in the DOM [WEB-8]. |
| Keyboard, pointer, trackpad | ARIA requires a menu to manage focus: arrows move inside it and Tab leaves it [WEB-8]. The product's map: focus goes to the first item, Up, Down, Home and End move, Enter chooses, and an item's single-key `shortcut` runs it. Escape closes and returns focus to the trigger. Tab closes and moves on from the trigger. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Item styles, the edge and ring, six items or fewer, and destructive items last after a separator, opening a confirmation [WEB-1]. The starter's menu library keeps Tab inside an open menu, an accepted choice. ARIA describes Tab as leaving a managed container [WEB-8]. |
| Platform owns | Reporting the item in hand as focused [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Menu and Menubar and Menu Button key maps, including type-ahead and wrapping, since those pages are not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

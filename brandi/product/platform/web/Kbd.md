# Kbd on the web

The key shows a keyboard shortcut in menus, the command menu and hints, and it is plain text on the web.

```yaml
component: Kbd
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | None in the registry. The control the shortcut acts on carries it as `aria-keyshortcuts`, where Meta is the Command key and Alt the Option key on Apple computers [WEB-8]. |
| Target and spacing | None. A key is not a target [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Key text 4.5:1 on its cap (1.4.3) [WEB-1]. The cap's outline identifies no control, so 1.4.11 asks nothing of it [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | None. It hides on touch screens, which `pointer: coarse` and `hover: none` report [WEB-9]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Plain text, read as written. The control it describes carries `aria-keyshortcuts` with key names such as `Meta+K` and `Control+K` [WEB-8]. |
| Navigation placement | Inline, beside the command it names [WEB-8]. A `rail` variant sits on the rail. |
| Keyboard, pointer, trackpad | None. It describes a shortcut and does nothing itself. A single-key shortcut it shows must be able to be turned off (2.1.4) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The cap's look, the `rail` variant, and the Mac form ("⌘K") shown as "Ctrl K" on Windows and Linux, inside 4.5:1 [WEB-1]. |
| Platform owns | How assistive tech reads `aria-keyshortcuts` [WEB-8]. |
| Not confirmed | Native control: the HTML `kbd` element, since the HTML standard is not in the registry. Accessibility API: how screen readers read ⌘ and other key symbols, since no registry page covers it. States: telling a touch screen from a mouse before the page hydrates, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |

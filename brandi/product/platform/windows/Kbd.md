# Kbd on Windows

A key or shortcut shown as a small label, written for Windows as "Ctrl K".

```yaml
component: Kbd
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-18
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
    marker: 2026-10-04
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No control. A styled `TextBlock` [WIN-19]. On the command itself, `KeyboardAccelerator` defines the shortcut [WIN-18] and can display its label [WIN-25]. |
| Target and spacing | Not pressable. Spacing on the 4 epx grid [WIN-16]. |
| Type | Caption, 12 on 16 epx, for confined spaces [WIN-4] [FLU-3]. Never below 12 px Regular [WIN-5]. |
| Colour and theme | A quieter theme brush [WIN-8]. In contrast themes, `SystemColorWindowTextColor`, never `SystemColorGrayTextColor`, which is kept for disabled content [WIN-9]. |
| States | None. It is static text, never a tab stop [WIN-17]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text, named by its own text [WIN-19]. The command it belongs to also exposes the shortcut through `AutomationProperties.AcceleratorKey` [WIN-18]. |
| Navigation placement | Beside menu items, in the command menu and in tooltips, which is where Microsoft documents accelerators [WIN-17]. |
| Keyboard, pointer, trackpad | Not focusable. The shortcut itself is Ctrl plus a key, working across the app [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Written in the Mac form and shown as "Ctrl K" on Windows, hidden on touch screens, with a rail variant. Microsoft writes shortcuts with a plus sign, as in Ctrl+S [WIN-17]. The product's form departs from that, and the product's guidelines apply (2.3). |
| Platform owns | The shortcut keys themselves, which Microsoft keeps consistent across apps [WIN-17]. |
| Not confirmed | A key-cap text style. Detecting a touch-only device to hide it. |

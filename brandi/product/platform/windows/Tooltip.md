# Tooltip on Windows

A short label on hover or keyboard focus, built on the WinUI `ToolTip`.

```yaml
component: Tooltip
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
    marker: undated
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
  - key: WIN-20
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `ToolTip`, attached through `ToolTipService.ToolTip` [WIN-6] [WIN-13]. |
| Target and spacing | Not pressable. On the 4 epx grid [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Corners 4 px, the exception among overlays because of its small size [WIN-12]. In contrast themes, popups take `SystemColorWindowColor` with `SystemColorWindowTextColor` [WIN-9]. |
| States | Hidden or shown, through `ToolTipService` [WIN-13]. |
| Motion | Enter and exit is Fluent's pattern for elements that appear and disappear [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. A button's help text carries the same kind of information as its tooltip [WIN-20], so set `AutomationProperties.HelpText` to match [WIN-19]. |
| Navigation placement | Over its trigger, outside the layout. Clipped text gets a tooltip with the full text [WIN-6]. |
| Keyboard, pointer, trackpad | Accelerators are documented in tooltips [WIN-17] [WIN-18]. Whether it opens on keyboard focus and closes on Esc: not confirmed. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | One short sentence at most, never the only home for essential information, never interactive, and always on a focusable trigger. A definition people need on touch is a toggletip instead. Microsoft's own use, the full text of clipped content [WIN-6], fits those rules. |
| Platform owns | The tooltip service [WIN-13]. Its 4 px corners [WIN-12]. Contrast theme colours [WIN-9]. |
| Not confirmed | Show delay and placement. Opening on keyboard focus. Closing on Esc. |

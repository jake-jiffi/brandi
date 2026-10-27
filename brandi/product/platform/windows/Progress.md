# Progress on Windows

Progress toward a known end, with an optional target marker, built on the WinUI `ProgressBar`.

```yaml
component: Progress
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
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-7
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color
    marker: 2026-10-13
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
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
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
| Native control | WinUI `ProgressBar`, a bar element with 4 px corners [WIN-12]. The target marker is custom. |
| Target and spacing | Not pressable. Height on the 4 epx grid [WIN-16]. |
| Type | The label and the numbers in words ("34 of 40 h") in Body or Caption [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | In contrast themes, UI in progress takes `SystemColorHighlightColor` [WIN-9]. Tones never carry meaning alone [WIN-7]. Corners 4 px [WIN-12]. |
| States | A known amount, or an unknown length. In contrast themes the fill takes the in-progress colour [WIN-9]. Whether `ProgressBar` draws an unknown length: not confirmed. |
| Motion | A bar for an unknown length moves on its own. Check `UISettings.AnimationsEnabled` [WIN-11]. WinUI's behaviour when it is false: not confirmed. |
| Accessibility API | Narrator through UI Automation. Name from its label through `AutomationProperties.Name` or `LabeledBy` [WIN-19]. Only controls with value semantics expose a value [WIN-19]. `ProgressBar`'s value exposure: not confirmed. |
| Navigation placement | Cards, list rows and forms, with its label 12 epx away [WIN-4]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The tones, the target marker, `showValue`, and the numbers in words beside it. An unknown length is indeterminate, never a made-up percentage. Microsoft's 4 px bar radius applies unless the brand overrides it [WIN-12]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | `ProgressBar`'s value exposure and control type. Whether `ProgressBar` has an indeterminate mode, and its motion when animations are off. A target marker pattern. |

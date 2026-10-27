# Source on Windows

A citation chip under an answer that links to where a figure came from.

```yaml
component: Source
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-3
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
| Native control | WinUI `HyperlinkButton`, since it navigates [WIN-13]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. 8 epx between chips [WIN-4]. |
| Type | Caption, 12 on 16 epx, or Body [WIN-4] [FLU-3]. Never below 12 px Regular [WIN-5]. |
| Colour and theme | In contrast themes, `SystemColorHotlightColor`, which is kept for hyperlinks [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Keyboard focus draws a 2 px outer and 1 px inner border, 1 px outside the control [WIN-3]. Pointer over and pressed styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Name from its label [WIN-19]. Narrator has a links view [WIN-17]. |
| Navigation placement | Under the answer, beside the paragraph that holds the figure. A row of chips is a related group [WIN-17]. |
| Keyboard, pointer, trackpad | Tab reaches it, and Enter activates it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The icon, the label, the link to the figure's origin, and one on every figure. The chip's shape follows the brand's corner tokens through `ControlCornerRadius` [WIN-12]. |
| Platform owns | Hyperlink colour in contrast themes [WIN-9]. |
| Not confirmed | The link control type in UI Automation. Pointer over and pressed styling. Haptic guidance. |

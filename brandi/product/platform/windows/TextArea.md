# TextArea on Windows

Multi-line text for notes and messages, built on a wrapping `TextBox`.

```yaml
component: TextArea
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
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
| Native control | WinUI `TextBox` with `AcceptsReturn` true and `TextWrapping` set to Wrap [WIN-6]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. 8 epx to its header [WIN-4]. Let the platform size it, and avoid absolute sizes [WIN-6]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Wrapping keeps the layout flexible as text scales to 225% [WIN-6]. Lines of 50 to 60 characters read best [WIN-5]. |
| Colour and theme | Common controls draw with theme brushes [WIN-8]. In contrast themes, the field takes the `SystemColorButtonFaceColor` pair, placeholder text `SystemColorWindowTextColor`, and disabled text `SystemColorGrayTextColor` [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Rest, pointer over, focused and disabled. Disabled leaves the tab order [WIN-18]. Read-only and invalid styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Name from the label through `AutomationProperties.LabeledBy` [WIN-19]. Value through `IValueProvider` on `TextBoxAutomationPeer` [WIN-19]. |
| Navigation placement | Form content, with its header above at 8 epx [WIN-4]. |
| Keyboard, pointer, trackpad | Keyboard input goes to text entry first [WIN-17]. Arrow keys move the caret [WIN-17]. The touch keyboard opens when the person focuses it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Starts at the product's minimum height and grows downward, a label that says what the text is for ("Notes for finance"), and a character count only under a hard limit. Growing with its content follows Microsoft's advice to let controls size themselves [WIN-6]. |
| Platform owns | Text scaling [WIN-6]. The touch keyboard [WIN-17]. |
| Not confirmed | A resize handle. How a character count reaches UI Automation. Read-only and invalid styling. Haptic guidance. |

# TextInput on Windows

A single-line text field, built on the WinUI `TextBox`.

```yaml
component: TextInput
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
| Native control | WinUI `TextBox` [WIN-12] [WIN-17], with `PlaceholderText` for an example value [WIN-6]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. 8 epx to its header, 12 epx to a label [WIN-4]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. `TextBox` supports the full text scaling range with no templating [WIN-6]. Hard-coded control heights break it [WIN-6]. |
| Colour and theme | Common controls draw with theme brushes [WIN-8]. In contrast themes, interactive UI takes `SystemColorButtonFaceColor` with `SystemColorButtonTextColor`, placeholder text takes `SystemColorWindowTextColor`, and disabled text takes `SystemColorGrayTextColor` [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Rest, pointer over, focused and disabled. Disabled leaves the tab order [WIN-18]. Read-only and invalid styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Name from the label through `AutomationProperties.LabeledBy` [WIN-19], since a `TextBox` would otherwise promote its own text as its name [WIN-19]. Value through `IValueProvider` on `TextBoxAutomationPeer` [WIN-19]. How a prefix or suffix is read with the field: not confirmed. |
| Navigation placement | Form content, with its header above at 8 epx [WIN-4]. |
| Keyboard, pointer, trackpad | Keyboard input goes to text entry first, ahead of other commands [WIN-17]. Arrow keys move the caret [WIN-17]. The touch keyboard opens when the person focuses the field, not when code moves focus there [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Size tokens, the `line-control` border at 3:1, a dashed edge and a lock when read-only, and a placeholder that shows an example, never the label. Input type and autofill set on every field. Microsoft's touch target still applies to every size [WIN-2]. |
| Platform owns | The touch keyboard's behaviour [WIN-17]. Text scaling [WIN-6]. |
| Not confirmed | `TextBox`'s UI Automation control type and full visual states. Read-only and invalid styling. Input scope and autofill. How a prefix or suffix is read with the field. Haptic guidance. |

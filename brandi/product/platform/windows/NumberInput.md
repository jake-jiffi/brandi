# NumberInput on Windows

A quantity or an amount, with step buttons.

```yaml
component: NumberInput
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
| Native control | WinUI `NumberBox`, named in the Windows App SDK release notes' API lists [WIN-25], with no guidance in the registry. Closest documented pattern: a `TextBox` [WIN-19] with `RepeatButton`s, which Microsoft names for raising and lowering a counter [WIN-13]. |
| Target and spacing | The field and step buttons take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, field and buttons take the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Rest, focused, invalid and disabled. Disabled leaves the tab order [WIN-18]. Invalid styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Name from the label through `AutomationProperties.LabeledBy` [WIN-19]. A `TextBox` exposes its value through `IValueProvider` [WIN-19]. Step buttons show icons, so `AutomationProperties.Name` says what they change ("Increase quantity") [WIN-19]. |
| Navigation placement | Forms and order lines, with the header above at 8 epx [WIN-4]. |
| Keyboard, pointer, trackpad | A `RepeatButton` repeats while held, after its `Delay` and at its `Interval` [WIN-13]. In a `TextBox`, arrow keys move the caret [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The right input mode, a prefix or suffix read with the field, and step buttons named for what they change. A typed value is checked when the person leaves the field, and Up and Down step the value. Up and Down depart from a text field's caret keys [WIN-17], and the product's guidelines apply (2.3). |
| Platform owns | `RepeatButton` timing [WIN-13]. |
| Not confirmed | `NumberBox` guidance, range exposure and keys. Invalid styling. Haptic guidance. |

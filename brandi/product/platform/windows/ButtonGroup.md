# ButtonGroup on Windows

Related buttons in a row with an even gap, built from plain `Button`s because WinUI has no group control.

```yaml
component: ButtonGroup
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
  - key: WIN-7
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color
    marker: 2026-10-13
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
| Native control | No group control. A `StackPanel` of `Button`s [WIN-17]. For arrow keys between them, set `XYFocusKeyboardNavigation` to Enabled and keep each button a tab stop, as `ContentDialog` does [WIN-17]. |
| Target and spacing | Each button takes the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | Labels in Body, 14 on 20 epx [WIN-5] [FLU-3]. When a label passes 26 characters, widen the buttons, stack them and wrap [WIN-13]. |
| Colour and theme | Each button keeps its own brushes [WIN-8]. One accent button at most, since accent is used sparingly [WIN-7]. In contrast themes each button takes the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Each button's own states, through theme resources [WIN-8]. The group adds none. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The group exposes no name, since panels don't, and each button carries its own name and role [WIN-19] [WIN-20]. |
| Navigation placement | Commit order for one decision: OK, Do it or Yes first, then Don't do it or No, then Cancel [WIN-13]. Show one or two at a time [WIN-13]. |
| Keyboard, pointer, trackpad | Tab moves between the buttons. Arrow keys can as well, through `XYFocusKeyboardNavigation`, with each button keeping its tab stop [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The gap token, the wrap, and one primary per group. The product's order (secondary first, Cancel immediately left of the primary) is its web order. On Windows the commit order applies [WIN-13], because the product never shares one order across platforms. |
| Platform owns | The commit order [WIN-13]. Activation keys [WIN-13]. |
| Not confirmed | A wrapping layout panel, which no registry page names. How to align a group of two or more buttons on a page. Haptic guidance. |

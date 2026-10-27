# Tag on Windows

A category someone assigned, shown as an outlined label with a colour dot and an optional remove button.

```yaml
component: Tag
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
| Native control | No tag control in the registry's pages. A `TextBlock` and a dot in an outlined container [WIN-19], with a remove `Button` [WIN-13]. |
| Target and spacing | The remove button takes the 40 × 40 px touch target [WIN-2]. On the 4 epx grid [WIN-16]. |
| Type | Caption, 12 on 16 epx [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | The dot never carries meaning alone, the word does [WIN-7]. In contrast themes, `SystemColorWindowTextColor` for the label and the `SystemColorButtonFaceColor` pair for the remove button [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Static, plus the remove button's own states [WIN-8]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The label is static text [WIN-19]. The remove button shows only an icon, so `AutomationProperties.Name` says "Remove [tag]" [WIN-19] [WIN-20]. |
| Navigation placement | Record headers, list rows and table cells. The remove button sits at the trailing end, where a lone button in a container goes [WIN-13]. |
| Keyboard, pointer, trackpad | Tab reaches the remove button, and Enter or Space activates it [WIN-13] [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One colour per category, matching its chart series everywhere, grey for unknown, and visibly unlike Badge's status tints. The product's small remove target off touch departs from Microsoft's 7.5 mm target [WIN-2], and the product's guidelines apply (2.3). |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party tag or token control. Haptic guidance. |

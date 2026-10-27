# FormActions on Windows

The row of buttons that ends a form, in Windows commit order.

```yaml
component: FormActions
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
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
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
| Native control | `Button`s in a row, an accent primary and Cancel [WIN-13]. |
| Target and spacing | Each takes the 40 × 40 px touch target [WIN-2] and is at least 120 px wide for a short label [WIN-13]. 8 epx between buttons [WIN-4]. A destructive button takes more padding and sits further from the content edge [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Past 26 characters, widen, stack or wrap [WIN-13]. |
| Colour and theme | Accent on the primary only, used sparingly [WIN-7]. In contrast themes each button takes the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Each button's own states, through theme resources [WIN-8]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Each button has control type Button, a name from its text, and help text that says what it does [WIN-20]. |
| Navigation placement | Foot of the form. Windows commit order puts the "do it" button first and Cancel last [WIN-13]. A page with one button, such as Apply at the foot of a settings page, left-aligns it [WIN-13]. |
| Keyboard, pointer, trackpad | Enter or Space activates the focused button [WIN-13]. Commit buttons get access keys [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | A primary that names the result ("Save billing"), never "Submit". Right-aligned by default, left for narrow forms, with a destructive action apart on the left as a `danger` button. Right alignment departs from Microsoft's left-aligned page button [WIN-13], and the far-left destructive button departs from its advice to keep risky targets away from the content edge [WIN-2]. The product's guidelines apply (2.3). |
| Platform owns | Commit order, "do it" first and Cancel last [WIN-13]. The product never shares one order across platforms, so its web order stays on the web. |
| Not confirmed | Alignment for a page with two or more buttons. Whether Enter commits a page form the way `DefaultButton` commits a dialog. Haptic guidance. |

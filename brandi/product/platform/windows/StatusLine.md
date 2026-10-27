# StatusLine on Windows

The answer's one status line, saying what the assistant is doing and how it ended, with Stop when there is no composer.

```yaml
component: StatusLine
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | No control. A `TextBlock` for the line [WIN-19], a decorative progress grid, and a Stop `Button` [WIN-13]. |
| Target and spacing | Stop takes the 40 × 40 px touch target [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | In contrast themes, in-progress UI takes `SystemColorHighlightColor` and the line `SystemColorWindowTextColor` [WIN-9]. |
| States | Working, waiting for approval, done, stopped and failed, each in words [WIN-7]. |
| Motion | The grid moves and the timer counts. When `UISettings.AnimationsEnabled` is false, the grid holds still and the timer keeps counting [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Grid, shimmer and timer are decorative, `AccessibilityView` Raw [WIN-19]. The line is the answer's one live region, and how it reaches Narrator is not confirmed. |
| Navigation placement | Inside the answer, in page content or the ask panel, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Tab reaches Stop, and Enter or Space activates it [WIN-13] [WIN-17]. Focus then moves to the "Stopped at step N of M" line, the most logical element after a stop [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The lines in the status table ("Working. Step 1 of 3: finding the invoices", "Answer ready"), speaking only on a change, a repeat announced again, a finished answer loading quietly, and numbers as words. Decorative parts stay out of the tree, as Microsoft asks for decoration [WIN-19]. |
| Platform owns | The animations setting [WIN-11]. |
| Not confirmed | How a live status line is announced to Narrator. Repeating an identical message. Haptic guidance. |

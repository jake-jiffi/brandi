# ErrorSummary on Windows

After a failed save, a titled list of what stopped it, each line jumping to its field.

```yaml
component: ErrorSummary
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
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
| Native control | No summary control. A title `TextBlock` and one `HyperlinkButton` per error, since each moves the person to a field rather than acting [WIN-13]. Errors stay on the page canvas, never in a dialog [WIN-14]. |
| Target and spacing | Each link takes the 40 × 40 px touch target [WIN-2]. 12 epx between content areas [WIN-4]. |
| Type | Title in Subtitle, 20 on 28 epx, or Body Strong where space is tight [WIN-4] [FLU-3]. Messages in Body [WIN-5]. Wraps as text scales [WIN-6]. |
| Colour and theme | The error tone plus an icon, never colour alone [WIN-7]. In contrast themes, links take `SystemColorHotlightColor` and text `SystemColorWindowTextColor` [WIN-9]. |
| States | Shown or gone. Each link draws the focus visual, a 2 px outer and 1 px inner border [WIN-3]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The title is static text, named by its own words [WIN-19]. Each link is named by its message [WIN-19]. Narrator has a headings view [WIN-17]. How to mark the title as a heading: not confirmed. |
| Navigation placement | Top of the form, on the page canvas, since validation errors stay out of dialogs [WIN-14]. |
| Keyboard, pointer, trackpad | It takes focus when it appears, so the keyboard is one Tab from the first problem, and Microsoft asks that initial focus land on the most logical element [WIN-17]. Enter activates a link [WIN-17], which moves focus to its field. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The title ("Fix these and try again"), messages that match each Field error word for word, focus on arrival, and everything typed kept. Used past about five fields, or when an error falls out of view. Keeping errors inline follows Microsoft's own rule [WIN-14]. |
| Platform owns | Contrast theme colours [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | Heading semantics in UI Automation. How the summary is announced when it takes focus. Haptic guidance. |

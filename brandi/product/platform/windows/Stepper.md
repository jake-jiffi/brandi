# Stepper on Windows

Progress through a short setup, with finished steps checked and the current one marked.

```yaml
component: Stepper
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
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No stepper control. Steps as a list [WIN-22], with Back and Next buttons, the labels Microsoft gives wizard navigation [WIN-13]. |
| Target and spacing | Revisitable steps and buttons take the 40 × 40 px touch target [WIN-2]. |
| Type | Labels in Body and descriptions in Caption [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | State shown by icon and word, never colour alone [WIN-7]. In contrast themes the current step takes the highlight pair [WIN-9]. |
| States | Completed, current and not started, each said in words [WIN-7]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Each label is read with its state ("Connect [source], Completed") through `AutomationProperties.Name` [WIN-19]. |
| Navigation placement | Top of the setup flow, in page content, with Back and Next at its foot [WIN-13]. |
| Keyboard, pointer, trackpad | Finished steps are links or buttons, activated by Enter or Space [WIN-13] [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Five steps at most, each named by its outcome, and finished steps revisitable. Microsoft's wizard buttons are Back and Next [WIN-13]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party stepper. How step state is exposed beyond the name. Haptic guidance. |

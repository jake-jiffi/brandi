# OnboardingChecklist on Windows

First-run tasks someone can do in any order, with progress in words.

```yaml
component: OnboardingChecklist
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
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
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
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
| Native control | A `ListView` of tasks [WIN-22] with their states, and a `ProgressBar` for the total [WIN-12]. |
| Target and spacing | Tasks take the 40 × 40 px touch target [WIN-2]. |
| Type | Task names in Body, the count in Caption [WIN-4] [FLU-3]. |
| Colour and theme | Done shows as a check and words, never colour alone [WIN-7]. In contrast themes, progress takes `SystemColorHighlightColor` [WIN-9]. |
| States | Done and not done for each task, in words [WIN-7]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before adding any [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each task is named by its outcome with its state [WIN-19]. A task whose state changes on screen exposes it through `ItemStatus` [WIN-21]. |
| Navigation placement | Home or a first-run page, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Up and Down move through tasks, and Enter opens one [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Tasks in any order, named by outcome, revisitable when done, and progress in words ("2 of 5 done"). Not a Stepper. Microsoft's progress bar carries the total [WIN-12]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | How a finished task is announced. Haptic guidance. |

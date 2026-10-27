# CommandMenu on Windows

The palette for jumping to records, running actions and asking the assistant, opened with Ctrl+K.

```yaml
component: CommandMenu
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
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
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
| Native control | No palette control. Closest pattern: an `AutoSuggestBox` [WIN-17], hosted in a `ContentDialog` when it opens modal [WIN-14]. `KeyboardAccelerator` binds Ctrl+K [WIN-18]. |
| Target and spacing | Results take the 40 × 40 px touch target [WIN-2]. On the 4 epx grid [WIN-16]. |
| Type | Body for results, and Caption for group labels and meta [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Overlay corners 8 px [WIN-12]. In contrast themes, the active result takes the highlight pair and the surface a 2 px border [WIN-9]. |
| States | Open or closed, with the active result in the highlight pair [WIN-9]. |
| Motion | Enter and exit [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Narrator offers a suggestions view [WIN-17]. The input is named by its placeholder ("Search or ask") through `AutomationProperties.Name` [WIN-19]. How the active result is followed: not confirmed. |
| Navigation placement | Near the top of the window, over everything, as a dialog when `modal` [WIN-14]. |
| Keyboard, pointer, trackpad | Ctrl+K opens it, an accelerator that works across the app [WIN-17]. Typing filters. In the suggestion list, Down goes to the first result and Up to the last, cycling at the ends [WIN-17]. Space does not choose and Enter does [WIN-17]. Esc closes it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Groups in the order Jump to, Actions, Ask, an offer to ask only when `onAsk` is passed, and records found by name. The modal form keeps to one dialog per window [WIN-14]. |
| Platform owns | Accelerator and Esc behaviour [WIN-17]. One `ContentDialog` per window [WIN-14]. |
| Not confirmed | A first-party palette control. How a screen reader follows the active result. Grouped suggestion lists. Haptic guidance. |

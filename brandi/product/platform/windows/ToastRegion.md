# ToastRegion on Windows

The queue that shows, times and pauses toasts.

```yaml
component: ToastRegion
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No in-app queue in the registry's pages. The release notes list `AppNotification` APIs [WIN-25], with no registry guidance on what they show or where. Closest pattern: a custom host for transient surfaces, with 8 px overlay corners [WIN-12]. |
| Target and spacing | Toast buttons take the 40 × 40 px touch target [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. |
| Colour and theme | In contrast themes each toast takes `SystemColorWindowColor` with a 2 px border [WIN-9]. |
| States | Empty, showing, queued and paused, with each toast's buttons keeping their contrast pair [WIN-9]. |
| Motion | Enter and exit [FLU-5]. Direct entrance at 167, 250 or 333 ms, and exit at 167 ms with a fade out [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Buttons are named by their text [WIN-19]. How each toast is announced: not confirmed. |
| Navigation placement | Bottom centre of the window. Surfaces that share an entry point appear and leave the same way [WIN-10]. |
| Keyboard, pointer, trackpad | Toast buttons take Tab, then Enter or Space [WIN-13] [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | 5 seconds, or 8 with Undo, paused while hovered or focused, above the phone action bar, and one at a time. Microsoft's motion consistency principle fits a single entry point [WIN-10]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | An in-app notification queue. Announcing a toast. Pausing on focus. Haptic guidance. |

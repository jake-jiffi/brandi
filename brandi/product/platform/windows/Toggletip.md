# Toggletip on Windows

A definition behind an info button that opens on a press and reads out.

```yaml
component: Toggletip
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
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
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
| Native control | An info `Button` with an attached `Flyout` [WIN-13] [WIN-12]. WinUI also offers `TeachingTip` as a transient overlay [WIN-12], with no guidance in the registry. |
| Target and spacing | The info button takes the 40 × 40 px touch target [WIN-2]. 8 epx between it and its flyout [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. One or two sentences, wrapping as text scales [WIN-6]. |
| Colour and theme | Corners 8 px through `OverlayCornerRadius` [WIN-12]. In contrast themes, `SystemColorWindowColor` with a 2 px border [WIN-9]. |
| States | Closed or open, as transient UI [WIN-17]. |
| Motion | Enter and exit [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The info button shows an icon, so it takes `AutomationProperties.Name` [WIN-19]. The definition can also go in its help text [WIN-19]. How the opened text is read out: not confirmed. |
| Navigation placement | Beside the term or figure it explains, anchored through `Placement` [WIN-13]. |
| Keyboard, pointer, trackpad | Enter or Space opens it [WIN-13], and Esc closes it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | As MetricCard's hint: hover after a short delay, a press, tap or Enter to open and read out, and Escape or a press elsewhere to close. Opening on hover departs from a button flyout's click to open [WIN-13], and the product's guidelines apply (2.3). |
| Platform owns | Esc for transient UI [WIN-17]. |
| Not confirmed | `TeachingTip` guidance. Reading the text out on open. Opening on hover. Haptic guidance. |

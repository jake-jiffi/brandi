# Thinking on Windows

The assistant's working line: a small progress ring, then what it is doing.

```yaml
component: Thinking
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
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No control. A `ProgressRing`, named in the Windows App SDK release notes [WIN-25], and a `TextBlock` holding the work [WIN-19]. |
| Target and spacing | Not pressable. On the 4 epx grid [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | In contrast themes the ring takes the in-progress colour, `SystemColorHighlightColor`, and the text `SystemColorWindowTextColor` [WIN-9]. |
| States | Working, then replaced by the result. The in-progress colour applies while it works [WIN-9]. |
| Motion | A constant-rate rotation, where Fluent allows linear easing [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The ring is decorative, `AccessibilityView` Raw [WIN-19], and the work is static text [WIN-19]. How it is read as a polite status when `live` is on: not confirmed. |
| Navigation placement | Inside an answer or a proposal, or on its own in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | It names the work ("Reading 12 [records]"), never "Thinking..." alone once the work is known, has no pulsing dots, and turns `live` off inside anything with its own status line. The ring slows rather than stops when animations are off, read from the animations setting [WIN-11]. |
| Platform owns | The animations setting [WIN-11]. Contrast theme colours [WIN-9]. |
| Not confirmed | How a polite status is announced. `ProgressRing` guidance, and its behaviour when animations are off. |

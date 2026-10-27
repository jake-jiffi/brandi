# LoadingState on Windows

An area waiting on another system, with what is happening, an indeterminate bar and the character at work.

```yaml
component: LoadingState
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
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
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
| Native control | No control. A title, a `ProgressBar` [WIN-12] for the bar, and the character as an animated icon [WIN-10]. |
| Target and spacing | Not pressable. 12 epx between the title, the bar and the second line [WIN-4]. |
| Type | Title in Body Strong or Subtitle, second line in Body [WIN-4] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | In contrast themes the bar takes the in-progress colour, `SystemColorHighlightColor` [WIN-9]. Bars take 4 px corners [WIN-12]. |
| States | Waiting, then replaced by content. Its text never uses `SystemColorGrayTextColor`, which is kept for disabled content [WIN-9]. |
| Motion | The bar and the character loop move on their own. Check `UISettings.AnimationsEnabled` [WIN-11]. Fluent asks for a no-motion setting [FLU-5]. |
| Accessibility API | Narrator through UI Automation. The title is static text [WIN-19], and the bar and character are decorative, `AccessibilityView` Raw [WIN-19]. How the line is read out as a polite update: not confirmed. |
| Navigation placement | In place of the content it waits for, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. A long wait offers a way to leave, and that is a button [WIN-13]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | A title that names the system and the work ("Pulling this week's [records] from [source]"), nothing under a second, a Skeleton for content arriving in place, and after ten seconds how long it usually takes. The bar slows instead of stopping when animations are off, read from the animations setting [WIN-11]. |
| Platform owns | The animations setting [WIN-11]. Contrast theme colours [WIN-9]. |
| Not confirmed | How a status line is announced politely. Whether `ProgressBar` has an indeterminate mode, and how it behaves when animations are off. |

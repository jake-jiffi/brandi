# Spinner on Windows

A small inline progress ring for a busy button or cell.

```yaml
component: Spinner
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
    marker: undated
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
| Native control | WinUI `ProgressRing`, named in the Windows App SDK release notes' API lists [WIN-25]. No registry page gives its design guidance. |
| Target and spacing | Not pressable. Sizes on the 4 epx grid [WIN-16]. |
| Type | None. The words beside it carry the state, and they scale with text [WIN-6]. |
| Colour and theme | Accent shows state [WIN-7]. In contrast themes, UI in progress takes `SystemColorHighlightColor` [WIN-9]. |
| States | Indeterminate only. In contrast themes it takes the in-progress colour, `SystemColorHighlightColor` [WIN-9]. |
| Motion | A constant-rate rotation, the kind of motion where Fluent allows linear easing [FLU-5]. What WinUI does with it when `UISettings.AnimationsEnabled` is false: not confirmed [WIN-11]. |
| Accessibility API | Narrator through UI Automation. With a label ("Loading"), `AutomationProperties.Name` [WIN-19]. When the words beside it already say it, decorative, `AccessibilityView` Raw [WIN-19]. Its control type: not confirmed. |
| Navigation placement | Inside a busy button, as its content [WIN-13], or a table cell. One at a time in any one place. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | It slows right down instead of stopping when animations are off, because a still indicator reads as a hang. One spinner at a time. "Loading" by default, and no label when the words beside it say what is happening. The slowdown is the product's rule, read from the animations setting [WIN-11]. |
| Platform owns | Contrast theme colours [WIN-9]. The animations setting [WIN-11]. |
| Not confirmed | `ProgressRing` design guidance, sizes and control type. Its behaviour when animations are off. |

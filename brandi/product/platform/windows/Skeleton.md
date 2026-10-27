# Skeleton on Windows

Grey shapes in the layout of content about to appear.

```yaml
component: Skeleton
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
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
| Native control | No skeleton control in the registry's pages. Plain shapes in the content's layout, filled with theme brushes [WIN-8]. |
| Target and spacing | Not pressable. On the 4 epx grid [WIN-16]. |
| Type | None. Skeleton lines stand in for text and hold no words, so text scaling has nothing to resize [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, shapes map to `SystemColor` resources, never hard-coded greys [WIN-9]. |
| States | None. A placeholder has no interactive states and is never a tab stop [WIN-17]. |
| Motion | A shimmer, unless `UISettings.AnimationsEnabled` is false [WIN-11]. Fluent asks for a no-motion setting [FLU-5]. |
| Accessibility API | Narrator through UI Automation. Decorative: no name, and `AutomationProperties.AccessibilityView` set to Raw [WIN-19]. "Loading" is said once, nearby. |
| Navigation placement | In place of the content it stands for, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The shapes, their grey, the shimmer, and its stop when animations are off. Microsoft's no-motion advice agrees with the stop [FLU-5]. |
| Platform owns | The animations setting [WIN-11]. Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party skeleton or shimmer control. |

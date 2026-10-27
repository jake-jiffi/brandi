# Character on Windows

The brand character or illustration, marking one state per screen as a still image or an animated icon.

```yaml
component: Character
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
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
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
| Native control | No control. A still pose goes in an `Image` [WIN-19]. A moving pose is an animated icon, which runs Lottie animations for vector icons and illustrations [WIN-10]. |
| Target and spacing | Not pressable. Layout on the 4 epx grid [WIN-16]. |
| Type | None. The words beside it carry the meaning, and they follow text scaling to 225% [WIN-6]. |
| Colour and theme | Never recoloured. Light and dark follow the user's setting [WIN-8], and contrast themes can replace every colour around it with the user's own [WIN-9]. |
| States | One pose per state the product names. A still image adds no states, and an animated icon can move from state to state [WIN-10]. |
| Motion | The working and calm loops run as animated icons [WIN-10]. Stop them when `UISettings.AnimationsEnabled` reports false [WIN-11]. Fluent asks for a no-motion setting and warns against flashes and sudden movement [FLU-5]. |
| Accessibility API | Narrator through UI Automation. Decorative: no name, and `AutomationProperties.AccessibilityView` set to Raw [WIN-19]. The words beside it carry the state. |
| Navigation placement | NavigationView's content area [WIN-15], inside empty, loading, done, welcome and help moments only. Never in tables, forms or a busy dashboard. |
| Keyboard, pointer, trackpad | Never focusable, since an `Image` is not a `Control` [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The poses, the 2D rendition, the loops and every rule on use: one per screen, never recoloured, flipped, rotated, cropped or squashed, and never on a form error. Windows sets nothing for app illustrations beyond the animated icon guidance [WIN-10]. |
| Platform owns | The `UISettings.AnimationsEnabled` value [WIN-11]. Contrast theme colours around it [WIN-9]. |
| Not confirmed | SVG support in `Image`. How an animated icon behaves when animations are off. Size and performance limits for animated icons. |

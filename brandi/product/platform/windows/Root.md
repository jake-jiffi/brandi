# Root on Windows

Theme, base type and the shortcut setting for everything in a window, carried on Windows by the app's own XAML resources rather than a control.

```yaml
component: Root
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
    marker: undated
    read: 2026-10-27
  - key: WIN-3
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
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
| Native control | No control. App.xaml does the job: `RequestedTheme` [WIN-8], `ResourceDictionary.ThemeDictionaries` with Default, Light and HighContrast entries [WIN-9], and app-wide overrides such as `SystemAccentColor` [WIN-8] and `ControlCornerRadius` [WIN-12]. |
| Target and spacing | No target of its own and no padding. Everything inside sizes and spaces in multiples of 4 epx [WIN-16]. |
| Type | One font across the app. Microsoft recommends the default, Segoe UI Variable, which XAML common controls pick for supported languages [WIN-5]. `LanguageFont` APIs give the recommended font per language [WIN-5]. Bold and Italic are not in the ramp [WIN-5]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | The theme follows the user's Windows setting until App.xaml sets `RequestedTheme` [WIN-8]. Contrast themes override it [WIN-8], and `ThemeSettings.HighContrast` detects them [WIN-9]. `HighContrastAdjustment` is on by default: set it to None once the theme resources map correctly [WIN-9]. Test light and dark [WIN-8], and all four built-in contrast themes: Aquatic, Desert, Dusk and Night sky [WIN-9]. |
| States | Light, dark, or a contrast theme the system applies over either [WIN-8] [WIN-9]. |
| Motion | Read `UISettings.AnimationsEnabled` once for the whole app [WIN-11]. Fluent asks every app for a no-motion setting [FLU-5]. Built-in control motion beats custom animation [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Root adds nothing to the tree: containers such as panels expose no name, and their meaningful children carry name and role [WIN-19]. |
| Navigation placement | Wraps the window's content. Design for the app window, not the screen: Small up to 640 px, Medium 641 to 1007 px, Large 1008 px and up [WIN-16]. |
| Keyboard, pointer, trackpad | Accelerators use Ctrl and work across the app. Access keys use Alt and work in the current window [WIN-17]. Shortcuts stay discoverable through tooltips, automation metadata and help [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The product's theme, brand face, accent and corner tokens, set app-wide: `SystemAccentColor` [WIN-8], `ControlCornerRadius` and `OverlayCornerRadius` [WIN-12], and the focus visual brushes [WIN-3]. Microsoft recommends one font, Segoe UI Variable [WIN-5]. A brand face departs from that, and the product's guidelines apply (2.3). The single-key shortcut switch is the product's own, and Ctrl shortcuts stay on. |
| Platform owns | Contrast themes, which override `RequestedTheme` [WIN-8] and swap in the user's colours [WIN-9]. Text scaling [WIN-6]. Effective-pixel scaling across plateaus from 100% to 400% [WIN-16]. |
| Not confirmed | Setting a theme on one region instead of the whole app, which the product's nested Root needs. Font smoothing and selection colour resources. What built-in controls change when animations are off. |

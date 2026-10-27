# Icon on Windows

One icon set, by name, drawn in the colour of the text beside it and rendered through a WinUI icon element.

```yaml
component: Icon
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
| Native control | `FontIcon` with a `Glyph`, as the Buttons and NavigationView samples use [WIN-13] [WIN-15], or `SymbolIcon` [WIN-15]. Segoe Fluent Icons is the system's user-interface font for app icons [WIN-5]. Animated icons run Lottie animations [WIN-10]. |
| Target and spacing | No target of its own. An icon that acts sits inside a `Button` [WIN-18], which takes the 40 × 40 px touch target [WIN-2]. Icon sizes sit on the 4 epx grid [WIN-16]. |
| Type | No text. Font icons used for emphasis or decoration keep their size when text scales: set `IsTextScaleFactorEnabled` to false [WIN-6]. |
| Colour and theme | Theme brushes, never hard-coded colours [WIN-8]. Icons need 3:1 against adjacent colours [FLU-4]. In contrast themes an icon takes the `SystemColor` of the text it sits with, such as `SystemColorWindowTextColor` [WIN-9]. |
| States | None of its own. It takes its parent control's state colours, and in contrast themes its parent's `SystemColor` pair [WIN-9]. |
| Motion | Static. Animated icons are short micro-interactions that give feedback from state to state [WIN-10]. Check `UISettings.AnimationsEnabled` before playing one [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Decorative by default: no name, and `AutomationProperties.AccessibilityView` set to Raw [WIN-19]. A meaningful icon takes `AutomationProperties.Name` [WIN-19]. In an icon-only button the name goes on the button [WIN-19]. |
| Navigation placement | Inside its parent: buttons, inputs, menus, and navigation items through `NavigationViewItem.Icon` [WIN-15]. |
| Keyboard, pointer, trackpad | Never focusable on its own. Put it inside a `Button` to inherit keyboard activation, focus and automation [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The product's one icon set, its stroke and its size scale, drawn in the text colour and never emoji. Microsoft names Segoe Fluent Icons as the system's icon font [WIN-5]. The product's own set departs from that, and the product's guidelines apply (2.3). |
| Platform owns | Contrast theme colours [WIN-9]. Effective-pixel scaling [WIN-16]. |
| Not confirmed | How to draw a non-font vector set, such as path or image icon elements. Size guidance for Segoe Fluent Icons. |

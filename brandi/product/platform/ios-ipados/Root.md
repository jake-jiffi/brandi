# Root on iOS and iPadOS

On iOS, Root's theme, base type and shortcut setting map to the system appearance, Dynamic Type and the app's own settings.

```yaml
component: Root
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest pattern is the system appearance, which puts every screen, view, menu and control in the light or dark palette [APL-5], with text styles carrying the base type [APL-3]. |
| Target and spacing | Root draws no control and adds no padding. Lay out with size classes, layout margins and safe area insets, never fixed widths [APL-20]. |
| Type | The base face. On iOS that is SF Pro through text styles, which follow Dynamic Type [APL-3]. Body is 17 pt at the default size and 53 pt at AX5 [APL-3]. Reach system fonts through `Font.Design`, never by embedding them [APL-3]. A custom brand face must support Dynamic Type and Bold Text [APL-3] [APL-8]. |
| Colour and theme | Light and dark follow the system setting, including Auto, which can switch while the app runs [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option, even in an app that ships one appearance [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. The app sets its own accent colour, and Apple asks that it be used sparingly [APL-4] [APL-8]. |
| States | Two appearances, each with an increased-contrast form [APL-4]. Test text in Dark Mode with Increase Contrast and Reduce Transparency on, separately and together [APL-5]. |
| Motion | Root sets no motion. It passes down the Reduce Motion setting, read with `accessibilityReduceMotion` [APL-24], under which automatic and repetitive animation is reduced [APL-1]. |
| Accessibility API | VoiceOver. Root exposes no element of its own. Everything inside it works with VoiceOver, Voice Control, Switch Control and Full Keyboard Access [APL-1], and follows Dynamic Type [APL-3]. |
| Navigation placement | Outside every container. The tab bar, sidebar and toolbars it wraps are the app's navigation [APL-9] [APL-10] [APL-11]. |
| Keyboard, pointer, trackpad | Carries the product's `shortcuts` setting, which turns single-key shortcuts off. Apple asks apps not to override system keyboard shortcuts, and to work with Full Keyboard Access [APL-1] [APL-16]. Custom shortcuts take Command as the main modifier and stay few [APL-16]. |
| Haptics | None. Root plays no haptic. Every haptic the app plays stays optional [APL-18]. |
| Brand may change | The product sets the base face, the text colour and the `shortcuts` setting. A custom face needs Dynamic Type and Bold Text support [APL-3] [APL-8]. The product's light and dark themes map to the system's two appearances, which people choose system-wide. Apple asks apps not to add their own appearance setting [APL-5]. If the product adds one anyway, its guidelines apply (2.3). |
| Platform owns | The system appearance and its Auto switching [APL-5]. Dynamic Type scaling, which people set [APL-3]. Reduce Motion and Increase Contrast, which people set and the app only reads [APL-24] [APL-25]. |
| Not confirmed | The iOS forms of the selection colour and of scroll indicators: no registry page covers them. The web's font smoothing and `font-synthesis` have no iOS counterpart in the registry. |

# Switch on iOS and iPadOS

A setting that applies at once on iOS is a toggle, the system's on and off switch.

```yaml
component: Switch
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-2
    url: https://developer.apple.com/design/human-interface-guidelines/buttons
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A toggle, which Apple lists among button-like components [APL-2] and its haptics page also calls a switch [APL-18]. The SwiftUI and UIKit API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | State never rides on colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | On, off and disabled. While someone activates it, the toggle takes on Liquid Glass [APL-7]. Disabled styling: not confirmed. |
| Motion | The Liquid Glass moment while it is active belongs to the system [APL-7]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isToggle` in SwiftUI or `.toggleButton` in UIKit [APL-23] [APL-29]. The label names the setting, never "On" or "Off" [APL-19]. |
| Navigation placement | A settings row in a grouped list [APL-14]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches switches, and Apple asks apps not to add their own keyboard navigation to them [APL-16]. iPhone has no focus system [APL-15]. |
| Haptics | Switches play system haptics by themselves on supported iPhones [APL-18]. Add none. |
| Brand may change | The label wording and the track colours. The product puts the switch before its label on a settings page. The iOS row order is not confirmed in the registry. If turning it on needs a confirmation or a save, use a Checkbox in a form. A restyle keeps familiar sizing and behaviour [APL-8]. |
| Platform owns | The system haptic [APL-18], the Liquid Glass moment [APL-7] and its handling under Full Keyboard Access [APL-16]. |
| Not confirmed | The toggle API, its place in a row and whether it shows on and off marks: the Toggles page is not in the registry. Disabled styling. |

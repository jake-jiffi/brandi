# Checkbox on iOS and iPadOS

A choice saved with a form on iOS becomes a list row that shows a checkmark, or a toggle when the setting applies at once, since the registry names no iOS checkbox.

```yaml
component: Checkbox
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named for iOS in the registry: Apple mentions checkboxes only in macOS alerts [APL-13]. The closest pattern is a list row that adds a checkmark when chosen [APL-14]. A setting that applies at once is a toggle [APL-2], the Switch. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | The checkmark carries the state, so colour is not the only cue [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Checked and unchecked: an options list highlights the row briefly, then adds a checkmark [APL-14]. Indeterminate and disabled: not confirmed. |
| Motion | The brief highlight before the checkmark [APL-14]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A checked row carries `isSelected` in SwiftUI or `.selected` in UIKit [APL-23] [APL-29]. The label states the outcome, such as "Email the [client] a copy" [APL-19]. |
| Navigation placement | In a form's grouped list [APL-14]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A focused list row draws white text on an accent-colour highlight [APL-15]. |
| Haptics | None specified for checkmark rows. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The check style and the label. The registry names no iOS control for the product's drawn box. The closest system pattern is the checkmark row [APL-14]. A drawn box is the product's call (2.3), at the platform's hit size [APL-1]. |
| Platform owns | The row highlight [APL-14] and the iPadOS focus highlight [APL-15]. |
| Not confirmed | A native checkbox for iOS. The indeterminate state. Disabled styling. |

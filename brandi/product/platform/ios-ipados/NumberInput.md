# NumberInput on iOS and iPadOS

A quantity or an amount on iOS is a number field with step buttons, which VoiceOver treats as an adjustable value.

```yaml
component: NumberInput
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
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-28
    url: https://developer.apple.com/documentation/swiftui/view/accessibilityaction(named:_:
    marker: iOS 16.0+, macOS 13.0+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. VoiceOver's adjustable pattern fits: UIKit's `.adjustable` trait, for continuous adjustment through a range [APL-29], and SwiftUI's `accessibilityAdjustableAction(_:)` [APL-28]. |
| Target and spacing | Each step button keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | A typed value is checked when the person leaves the field, never while they type. At a limit, the step button is unavailable. UIKit marks an unavailable element `.notEnabled` [APL-29]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Mark it adjustable, `.adjustable` in UIKit or `accessibilityAdjustableAction(_:)` in SwiftUI, so people can step the value [APL-28] [APL-29]. The step buttons are named by what they change ("Increase quantity") [APL-19]. |
| Navigation placement | In a form [APL-14]. |
| Keyboard, pointer, trackpad | The product's Up and Down keys step the value. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | Selection haptics give feedback while a value changes [APL-18], so one suits a stepping value if the product adds it. It stays optional [APL-18]. |
| Brand may change | The step buttons, the prefix or suffix, which is read with the field, and the number format. A restyle keeps familiar sizing [APL-8]. |
| Platform owns | VoiceOver's adjust gestures, which the adjustable action answers [APL-28]. |
| Not confirmed | The stepper control and number keyboards: the Steppers and Virtual keyboards pages are not in the registry. |

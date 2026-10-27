# Source on iOS and iPadOS

A citation chip under an answer on iOS links to where a figure came from.

```yaml
component: Source
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
| Native control | None named in the registry. The closest pattern is a link, `isLink` in SwiftUI or `.link` in UIKit [APL-23] [APL-29]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | The icon and the label name the source, never colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | A custom chip draws a press state, as Apple asks of custom buttons [APL-2]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. A link, `isLink` or `.link` [APL-23] [APL-29], named by its label [APL-19]. |
| Navigation placement | Under an answer, one chip per source [APL-19]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. The pointer takes the highlight effect on a small control with a transparent background, and lift on a small opaque one [APL-17]. |
| Haptics | None specified for source chips. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The chip's shape, icon and label. Every figure has a source. A restyle keeps it a familiar link [APL-8]. |
| Platform owns | Not confirmed: no registry page says what the system does when a link opens a web page or another app. |
| Not confirmed | What opens when a source points to a web page or another app. |

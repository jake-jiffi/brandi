# Toggletip on iOS and iPadOS

A definition people need on touch is, on iOS, an info button that opens a small popover and reads it out.

```yaml
component: Toggletip
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
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
| Native control | An info button that opens a popover. In a list row, Apple keeps the info button for revealing more about the row, never for navigating [APL-14]. Popovers take the regular Liquid Glass variant [APL-7]. The Popovers page and the API: not confirmed. |
| Target and spacing | The info button keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Dark Mode lifts a popover onto the elevated background [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Open and closed. A press, a tap or Enter opens it, and Esc, Apple's standard cancel key, or a press elsewhere closes it [APL-16]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The info button takes `isButton` or `.button` [APL-23] [APL-29], with a label naming what it explains [APL-19]. Opening reads the text out: post an `AccessibilityNotification` [APL-19]. |
| Navigation placement | Beside the label it explains, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | Full Keyboard Access activates the info button [APL-16]. Esc, Apple's standard cancel key, closes the popover [APL-16]. |
| Haptics | None specified for toggletips. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | One short definition and the info icon. The web's short hover delay does not carry over: Apple describes hover tooltips only for macOS and visionOS [APL-2]. |
| Platform owns | The popover's material and its elevated background [APL-7] [APL-5]. |
| Not confirmed | The popover API on iPhone, and pointer hover opening on iPadOS. |

# FilterChip on iOS and iPadOS

A filter chip on iOS is a custom toggle button above the list it filters, since the registry names no chip control.

```yaml
component: FilterChip
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None named in the registry. The closest pattern is a button that toggles, which VoiceOver reads with `isToggle` in SwiftUI or `.toggleButton` in UIKit [APL-23] [APL-29]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes a row of chips wraps rather than truncates [APL-3]. |
| Colour and theme | On takes the product's selected colour and a check, so state never rides on colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | On and off. A custom button always draws a press state [APL-2]. Disabled styling: not confirmed. |
| Motion | Avoid motion on interactions people repeat often [APL-6]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A toggle button, `isToggle` or `.toggleButton`, with its on state as `isSelected` or `.selected` [APL-23] [APL-29]. An `attention` count is read as words: "12 need you" [APL-19]. |
| Navigation placement | One row above the list or table it filters, in the content layer. Controls stay near the content they affect [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. The pointer takes the highlight effect on a small control with a transparent background, and lift on a small opaque one [APL-17]. |
| Haptics | None specified for filter chips. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The pill shape, the selected colour and check, the count and the `attention` highlight. The count is how many items match if the chip is applied. A restyle keeps the sizing, placement and behaviour of a familiar toggle button [APL-8]. |
| Platform owns | Full Keyboard Access and pointer effects [APL-16] [APL-17]. |
| Not confirmed | A native chip or token control for iOS: no registry page names one. Disabled styling. |

# Progress on macOS

Progress shows progress toward a known end on macOS, through a control the registry has no page for.

```yaml
component: Progress
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Not confirmed. The registry has no page on progress indicators for macOS. |
| Target and spacing | None. Not a target. |
| Type | Label and the numbers in words beside it, Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Tones in light, dark and increased-contrast variants [APL-4]. The words beside the bar carry the state, never colour alone [APL-1]. |
| States | Determinate or indeterminate, with an optional target marker. An unknown length is indeterminate, never a made-up percentage. How macOS draws each state: not confirmed. |
| Motion | The indeterminate bar slows right down under reduced motion. Apple asks apps to reduce automatic and repeating animation [APL-1]. The product's choice stands (2.3). Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the label and the value in words, such as "34 of 40 h" [APL-19]. Report completion with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In content, beside what it measures. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Tone, size and the target marker. Slowing the indeterminate bar departs from Apple's Reduce Motion guidance [APL-1] (2.3). |
| Platform owns | The Reduce Motion setting [APL-24]. |
| Not confirmed | The native progress indicator, its styles and sizes. How it reports its value. Placement guidance for a progress bar. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

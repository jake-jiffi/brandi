# Spinner on macOS

Spinner is a small indeterminate indicator for a busy button or cell on macOS, a control the registry has no page for.

```yaml
component: Spinner
platform: macos
checked_against: macOS 27 Golden Gate
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
| Native control | Not confirmed. The registry has no page on progress indicators for macOS. Apple's spinner-in-a-button guidance covers iOS and iPadOS only [APL-2]. |
| Target and spacing | None. A spinner is not a target. |
| Type | None. Its label, when shown, is Body text [APL-3]. |
| Colour and theme | Dynamic colours, so it reads in both appearances [APL-4]. Custom colours need increased-contrast variants too [APL-4]. |
| States | No states beyond spinning. One at a time in any one place. |
| Motion | Apple asks apps to reduce automatic and repeating animation under Reduce Motion [APL-1]. The product slows the spinner right down instead of stopping it, so it never looks like a hang. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A label, "Loading" by default, unless the words beside it say what is happening [APL-19]. Report the start and end of the work with `AccessibilityNotification` [APL-19]. |
| Navigation placement | Inside the busy button or cell. Apple places an activity indicator inside a button on iOS and iPadOS only [APL-2], so macOS placement is not confirmed. |
| Keyboard, pointer, trackpad | None. It takes no focus [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Size, colour and the slowed turn. Slowing rather than stopping departs from Apple's Reduce Motion guidance [APL-1]. The product's guidelines apply (2.3). |
| Platform owns | The Reduce Motion setting [APL-24]. |
| Not confirmed | The macOS progress indicator control, its sizes and its styles. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

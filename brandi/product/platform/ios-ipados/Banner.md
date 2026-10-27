# Banner on iOS and iPadOS

A one-line message across the top of the content on iOS covers sample data, read-only mode, a source that is down, or being offline.

```yaml
component: Banner
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. For a problem such as no connection, Apple prefers cached or placeholder data with a quiet label over an alert [APL-13]. That label is this component. |
| Target and spacing | Its action and dismiss buttons keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. One line at the default size. At large sizes it wraps rather than truncates [APL-3]. |
| Colour and theme | A tone with an icon and words [APL-1]. The top of the content stays legible at rest, under the bars [APL-4]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Shown while its state applies, and dismissible once it no longer does. Under a down source, the last good data stays, marked with its time [APL-13]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A banner present on arrival posts nothing. One that appears because something broke posts an `AccessibilityNotification` [APL-19]. |
| Navigation placement | At the top of the content, below the toolbar that titles the screen [APL-11]. One at a time. |
| Keyboard, pointer, trackpad | Its buttons: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for banners. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The tones and the copy, in the brand's voice [APL-8]. Offline is a `neutral` banner saying changes will save when the connection is back. |
| Platform owns | The toolbar above it and its scroll edge effect [APL-11]. |
| Not confirmed | Whether a banner can attach to the toolbar on iOS: no registry page covers it. |

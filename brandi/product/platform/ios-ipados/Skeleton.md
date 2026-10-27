# Skeleton on iOS and iPadOS

Grey shapes stand in on iOS where content is about to appear, in that content's layout, shimmering unless Reduce Motion is on.

```yaml
component: Skeleton
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | Not confirmed: no registry page names a placeholder or redaction view. The closest pattern is placeholder data, which Apple suggests over an alert when content is not ready at start-up [APL-13]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | None. The shapes take the size of the text they stand for, so they grow with Dynamic Type [APL-3]. |
| Colour and theme | System greys and fills adapt to both appearances [APL-4] [APL-7]. A custom grey needs light, dark and increased-contrast variants [APL-4]. |
| States | Shown while loading, then replaced by the content, with the change reported to VoiceOver [APL-19]. |
| Motion | The shimmer stops under Reduce Motion [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Hidden with `accessibilityHidden(_:)` [APL-19]. "Loading" is said once, nearby. |
| Navigation placement | In the layout of the content it stands for. When the content arrives, the layout change is reported to VoiceOver [APL-19]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for skeletons. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Shape radius and the grey tone, from the product's tokens, with light, dark and increased-contrast variants [APL-4]. |
| Platform owns | Reduce Motion, which people set [APL-24]. |
| Not confirmed | A native redaction or placeholder API. |

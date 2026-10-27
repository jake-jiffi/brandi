# AvatarGroup on iOS and iPadOS

Overlapping avatars on iOS show the people on a record, with "+N" for the rest, and VoiceOver names everyone.

```yaml
component: AvatarGroup
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is a row of images read as one element [APL-19]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | "+N" uses a text style [APL-3]. |
| Colour and theme | The edge that separates overlapping avatars, like every custom colour, needs light, dark and increased-contrast variants [APL-4]. |
| States | None of its own. Past `max`, 4 by default, "+N" stands for the rest, and the group still reads as one element [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. One element that names everyone, the hidden people included [APL-19]. |
| Navigation placement | On a record, beside its title or in a list row [APL-14]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for avatar groups. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | `max`, the sizes and the overlap. The product names hidden people on hover. Apple describes hover tooltips only for macOS and visionOS [APL-2], so the VoiceOver label carries the names. |
| Platform owns | VoiceOver's reading order [APL-19]. |
| Not confirmed | A touch way to see the hidden names without a tooltip: no registry page covers one. |

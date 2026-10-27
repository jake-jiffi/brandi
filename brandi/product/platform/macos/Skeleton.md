# Skeleton on macOS

Skeleton draws grey shapes where content is about to appear on macOS, with no native control in the registry.

```yaml
component: Skeleton
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None in the registry. Shapes drawn in the content layer, never on Liquid Glass [APL-7]. |
| Target and spacing | None. Not a target. |
| Type | None. It holds no text. |
| Colour and theme | Grey in the product's own colour, with light and dark variants [APL-4]. Apple asks apps not to repurpose system colours, such as a label colour used as a fill [APL-4]. Custom colours need increased-contrast variants too [APL-4]. |
| States | Shimmering, or still under Reduce Motion [APL-1]. |
| Motion | The shimmer stops under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Hidden with `accessibilityHidden(_:)` [APL-19]. Say "Loading" once, nearby. |
| Navigation placement | In place of the content that is loading, in that content's layout. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Shapes and the shimmer. Apple asks apps not to repurpose system colours for fills [APL-4]. |
| Platform owns | The Reduce Motion setting [APL-24]. |
| Not confirmed | A native placeholder pattern. Placement guidance for placeholders. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

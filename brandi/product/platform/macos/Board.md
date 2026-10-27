# Board on macOS

Board shows records in columns by stage on macOS, with no native control in the registry.

```yaml
component: Board
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. Columns of cards in the content layer [APL-7]. Apple asks for an on-screen alternative to every gesture [APL-1], so a Move to menu on every card does what dragging does. |
| Target and spacing | Cards and their menus meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Card titles in Headline, 13 pt, meta in Subheadline, 11 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Rest, selected and dragging. Where a card cannot land, the pointer shows `operationNotAllowed` [APL-17]. |
| Motion | A moved card fades into place under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each column is a group with its title and count [APL-19]. Moving a card is a named action, Move to [APL-28]. |
| Navigation placement | In the window's content. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each card's menu [APL-16]. Secondary click opens the Move to menu [APL-17]. |
| Haptics | None by default. On a Force Touch trackpad, the alignment pattern can mark a dragged card lining up with a column [APL-18]. Whether to play it: not confirmed. |
| Brand may change | Column count, card layout and counts. The Move to menu is the alternative to a gesture that Apple asks for [APL-1]. |
| Platform owns | Drag pointer styles and secondary click [APL-17]. |
| Not confirmed | A native board. Drag and drop guidance and API. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Tag on macOS

Tag is a category someone assigned on macOS: an outlined label with the category's colour dot.

```yaml
component: Tag
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. A label with a coloured dot. Fixed colours that carry meaning are an Apple pattern too, as Mail's yellow VIP sidebar icon shows [APL-10]. |
| Target and spacing | The remove button meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | SF Pro, never under 10 pt [APL-3] [APL-1]. |
| Colour and theme | The category colour never carries meaning alone: the word does [APL-1]. A category keeps one colour everywhere, and status colours never stand in for it [APL-4]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Rest, and the remove button's press state [APL-2]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver reads the tag's word. The remove button is named "Remove [tag]", with trait `isButton` [APL-19] [APL-23]. |
| Navigation placement | On a record, in rows and headers. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the remove button [APL-16]. Delete to remove a tag: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Category colours from the series slots, the outline and the dot. Apple allows fixed colours that carry meaning in a sidebar too [APL-10]. |
| Platform owns | Focus for the remove button under Full Keyboard Access [APL-16]. |
| Not confirmed | Token field behaviour, which would cover removable tags. Placement guidance for tags. Delete to remove a tag. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

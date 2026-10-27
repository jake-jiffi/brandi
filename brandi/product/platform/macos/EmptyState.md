# EmptyState on macOS

EmptyState says what is empty and what to do next on macOS, with no native control in the registry.

```yaml
component: EmptyState
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
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
| Native control | None in the registry. Apple asks that an empty section say why its content is unavailable rather than disappear [APL-9]. The closest pattern is a message with actions in the empty area. |
| Target and spacing | Actions meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Title in Title 2, 17 pt, or Title 3, 15 pt, body in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. The character's artwork must work in both appearances [APL-5]. |
| States | Nothing yet, no results, all done, could not load, no access and not found. Apple asks that an empty section explain itself [APL-9]. |
| Motion | The character's loop stops under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The title is a heading [APL-19]. The character is hidden [APL-19]. |
| Navigation placement | In place of the content that is missing [APL-9]. Inside a table it replaces the rows and keeps the header. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches its actions [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Kinds, sizes, the character and wording. Apple asks empty sections to explain themselves [APL-9], which the product does. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | Apple empty-state guidance beyond tab bar sections. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

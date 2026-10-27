# Pagination on macOS

Pagination pages through a long table on macOS, where tables already scroll by themselves.

```yaml
component: Pagination
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
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
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
  - key: APL-33
    url: https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push
    marker: macOS
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. A Mac `Table` scrolls vertically, and horizontally for extra columns [APL-26]. Where paging stays, previous and next are push buttons [APL-33]. |
| Target and spacing | Previous and next meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | "1 to 25 of 312" in Body or Callout [APL-3], in tabular figures. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Previous or next unavailable at the ends, text in `disabledControlTextColor` [APL-4]. "No results" at zero, and no buttons when everything fits. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver reads the range and each button's label, with trait `isButton` [APL-19] [APL-23]. |
| Navigation placement | Below the table it pages. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches both buttons [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Page size and the range wording. Paging sits over a table that already scrolls on macOS [APL-26]. |
| Platform owns | Scroll bars by the "Show scroll bars" preference [APL-26]. |
| Not confirmed | A native paging control. Placement guidance for paging controls. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

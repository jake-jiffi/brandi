# NavItem on macOS

NavItem is one destination in the macOS sidebar: a symbol, a label and an optional count.

```yaml
component: NavItem
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
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
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | A sidebar row [APL-10]. |
| Target and spacing | Row size follows the sidebar size setting [APL-10]. |
| Type | Label size follows the sidebar size [APL-10]. |
| Colour and theme | The icon takes the app accent, replaced by the person's accent unless it is a fixed colour with meaning [APL-10] [APL-4]. A focused row draws white text on an accent highlight [APL-15]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Current and rest, with or without a count. Zero shows nothing. The current row keeps the selection highlight [APL-14]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The current item carries `isSelected` [APL-23]. Counts are part of the label, in words: "Approvals, 3 need you" [APL-19]. |
| Navigation placement | In the sidebar [APL-10]. |
| Keyboard, pointer, trackpad | Sidebar items take focus as content [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Counts, icons and the current style. Apple asks sidebar icons to follow the person's accent unless a fixed colour carries meaning [APL-10]. |
| Platform owns | The accent replacement [APL-4]. Sidebar sizing [APL-10]. |
| Not confirmed | Count badges in a macOS sidebar. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

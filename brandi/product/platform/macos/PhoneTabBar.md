# PhoneTabBar on macOS

PhoneTabBar does not ship on macOS: on a Mac, the top-level places it holds belong in the sidebar.

```yaml
component: PhoneTabBar
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
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
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
| Native control | None. It is a phone component. On macOS, top-level areas go in a sidebar [APL-10]. Apple's tab bar guidance lists no extra considerations for macOS [APL-9], so a tab bar is the other option. |
| Target and spacing | Not applicable on macOS. Sidebar rows follow the sidebar size [APL-10]. |
| Type | Not applicable. In a sidebar, text size follows the sidebar size [APL-10]. |
| Colour and theme | Not applicable. In a sidebar, icons take the app accent, and the person's accent replaces it outside Multicolor [APL-4]. |
| States | Not applicable. In a sidebar, the current place keeps the selection highlight [APL-14]. |
| Motion | None on macOS [APL-6]. |
| Accessibility API | VoiceOver. In a sidebar, the current place carries `isSelected` [APL-23], and counts are part of the label in words [APL-19]. |
| Navigation placement | The sidebar, on the window's leading side [APL-10]. |
| Keyboard, pointer, trackpad | In a sidebar, items take focus as content [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Nothing on macOS. On phones, the product decides which bar owns the primary action. On a Mac, the toolbar holds the primary on its trailing edge [APL-11]. |
| Platform owns | The sidebar and toolbar layout [APL-10] [APL-11]. |
| Not confirmed | Whether any product ships a tab bar on macOS instead of a sidebar. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

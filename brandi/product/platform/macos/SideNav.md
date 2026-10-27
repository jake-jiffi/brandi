# SideNav on macOS

SideNav is in-page navigation for settings and long documents on macOS, closest to a sidebar of sections in the registry's pages.

```yaml
component: SideNav
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
| Native control | None in the registry. The closest pattern is a sidebar listing the sections [APL-10]. Command-Comma opens the settings window [APL-16]. |
| Target and spacing | Items meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The current item takes the selection highlight, accent with white text when focused [APL-15]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Current and rest. Nothing is current until set. The current item keeps the selection highlight [APL-14]. |
| Motion | Scrolling to a section follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The current item carries `isSelected` [APL-23]. Group the list under its label [APL-19]. |
| Navigation placement | Beside the sections it lists, sticky, on the leading side [APL-10]. |
| Keyboard, pointer, trackpad | Items take focus as content, highlighted rather than ringed [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | The current style and a ring. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Selection colours [APL-4]. |
| Not confirmed | Apple's settings window layout. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

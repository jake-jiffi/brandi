# Tabs on macOS

Tabs switch between sections of one view on macOS, which is a tab view, not Apple's tab bar for top-level areas.

```yaml
component: Tabs
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
| Native control | A tab view, which Apple's Tab bars page names as a related component [APL-9]. The tab bar itself moves between top-level sections of an app [APL-9], which is the Sidebar's job here. The tab view's own page is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Short labels, a single word where possible [APL-9]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The selected tab takes the product's strong text and underline. Badges are kept for critical information [APL-9]. Never colour alone: a word, shape or icon carries the meaning too [APL-1]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Selected, with or without counts. Never disable or hide a tab: an empty section explains why [APL-9]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The selected tab carries `isSelected` [APL-23]. Counts are part of the label, in words [APL-19]. |
| Navigation placement | Under the page header, above the panel it switches. Apple placement guidance for tab views: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the tabs [APL-16]. Arrow-key movement: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Underline style and counts. Apple asks for single-word labels and badges only for critical information [APL-9]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The tab view control, its API and its keyboard behaviour. Placement guidance for tab views. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Schedule on macOS

Schedule places records on a day, week or month grid on macOS, with no native control in the registry.

```yaml
component: Schedule
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | None in the registry. A grid in the content layer [APL-7], with a segmented control for Day, Week and Month [APL-2]. |
| Target and spacing | Events and controls meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Event titles in Callout, 12 pt, or Body, times in Footnote, 10 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Event colours never carry meaning alone, and today stands out by more than colour [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Day, week and month views, with events selected or not. A selected event carries `isSelected` [APL-23]. |
| Motion | Switching views fades under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Every event reads its time and title [APL-19]. A selected event carries `isSelected` [APL-23]. |
| Navigation placement | In the window's content. The view switcher sits in the toolbar's centre area [APL-11]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches every event [APL-16]. Arrow-key movement in the grid: not confirmed. |
| Haptics | None by default. Dragging an event could use the alignment pattern on a Force Touch trackpad [APL-18]. Whether it should: not confirmed. |
| Brand may change | Grid density, event colours and the views. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | A native calendar grid and its key map. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

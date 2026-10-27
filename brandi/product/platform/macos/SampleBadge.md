# SampleBadge on macOS

SampleBadge marks a window or card that shows sample data on macOS, beside the title, until the real connection is live.

```yaml
component: SampleBadge
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The registry names no sample marker. It is a badge-style label beside the view title [APL-11]. |
| Target and spacing | None. Not a target. |
| Type | SF Pro, never under 10 pt [APL-3] [APL-1]. |
| Colour and theme | Its tone in light, dark and increased-contrast variants [APL-4]. The word "Sample" carries the meaning [APL-1]. |
| States | No states. |
| Motion | None. |
| Accessibility API | VoiceOver reads it with the title it marks [APL-19]. |
| Navigation placement | Beside the view title, which sits at the toolbar's leading edge or in its centre area [APL-11]. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Wording and tone. Apple guidance on marking sample data: not confirmed. |
| Platform owns | Title placement in the toolbar [APL-11]. |
| Not confirmed | Whether a toolbar title area takes an accessory such as this badge. Apple guidance on marking sample data. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

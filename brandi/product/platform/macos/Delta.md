# Delta on macOS

Delta shows change against a comparison on macOS: an arrow and a value, judged good, bad or neutral.

```yaml
component: Delta
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
| Native control | None. The registry names no delta control. It is text with an SF Symbol arrow, which matches the text's weight [APL-3]. |
| Target and spacing | None. Not a target. |
| Type | SF Pro, at the size of the figure it supports [APL-3]. Tabular figures. |
| Colour and theme | Success when good, danger when bad, neutral when flat or neither. The arrow and the words carry it too [APL-1]. Red means danger in some cultures and something good in others [APL-4]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | No states. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver reads the whole judgement: "Up 6.2%, better vs last month" [APL-19]. Hide the arrow image [APL-19]. |
| Navigation placement | Beside its figure, in cards and table cells. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Colours, arrows and the comparison wording. Apple notes that red reads differently across cultures [APL-4]. |
| Platform owns | Dynamic colour switching [APL-4]. |
| Not confirmed | Nothing beyond placement. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

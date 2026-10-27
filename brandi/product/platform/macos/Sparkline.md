# Sparkline on macOS

Sparkline is a tiny trend with its last point marked, inside a metric card or a table cell on macOS, with no axes.

```yaml
component: Sparkline
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
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
| Native control | Not confirmed. The registry holds no chart framework and no Apple page on charts. The product draws its own chart, and Apple asks that charts and other infographics be fully accessible [APL-19]. |
| Target and spacing | None. Not a target. |
| Type | None. It holds no text. |
| Colour and theme | Always `series-1`, checked in both appearances [APL-4]. Never red or green: the Delta beside it judges the trend [APL-1]. Series colours need increased-contrast variants too [APL-4]. |
| States | Drawn, or broken where a value is missing. Apple guidance on chart states: not confirmed. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. With a `label`, the trend in words [APL-19]. Without one, hidden with `accessibilityHidden(_:)` [APL-19]. |
| Navigation placement | Inside a MetricCard or a table cell. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Colour, size and the last-point marker. Apple asks that meaningful images be described and decorative ones hidden [APL-19]. |
| Platform owns | How VoiceOver treats a hidden element [APL-19]. |
| Not confirmed | A native sparkline. Chart states and placement guidance. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

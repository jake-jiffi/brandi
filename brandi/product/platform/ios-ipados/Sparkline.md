# Sparkline on iOS and iPadOS

A tiny trend on iOS sits inside a MetricCard or a table cell, with its last point marked and no axes.

```yaml
component: Sparkline
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Not confirmed: the registry holds neither Apple's Charts page nor the Swift Charts API. The closest pattern it supports is a custom view whose data VoiceOver can reach [APL-19]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | None. It has no text, and its `label` carries the words [APL-19]. |
| Colour and theme | One series colour. The Delta beside it says whether the trend is good, so the line is never red or green and colour judges nothing [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | A gap where data is missing, never zero. No loading form of its own: its card shows that [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the `label`, the trend in words [APL-19]. Without a label it is decoration, hidden with `accessibilityHidden(_:)` [APL-19]. |
| Navigation placement | Inside a MetricCard or a table cell, beside the figure it supports [APL-19]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for sparklines. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Size and line weight. It supports a figure and never stands in for one. Kept in one series colour, since one colour never means two things [APL-4]. |
| Platform owns | VoiceOver's reading of the label [APL-19]. |
| Not confirmed | The Swift Charts API, the chart descriptor behind Audio graphs, and Apple's chart guidance: the Charts and Charting data pages are not in the registry. |

# Delta on iOS and iPadOS

Change against a comparison on iOS is an arrow and a value, read by VoiceOver as the whole judgement in words.

```yaml
component: Delta
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is a symbol beside text, read as one element [APL-19]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The arrow grows with the text, as SF Symbols do [APL-3]. |
| Colour and theme | Success when the change is good, danger when bad, neutral when flat. Direction and words carry it too, never colour alone [APL-1]. Red means danger in some cultures and good news in others [APL-4], so the words decide. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Up, down or flat, judged by `goodWhen`. The arrow's shape differs, not only its colour [APL-1]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads one label: "Up 6.2%, better vs last month" [APL-19]. The arrow on its own is decoration [APL-19]. |
| Navigation placement | Grouped with the figure it qualifies, in a MetricCard or a table cell [APL-19]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for deltas. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The arrow style and the tone roles. It always says what it is compared with. Costs, overdue amounts and churn are `goodWhen="down"`, and a change in a rate is in points. One colour never means two things [APL-4]. |
| Platform owns | Increase Contrast, which people set [APL-25]. |
| Not confirmed | Tabular figures on iOS: the registry's Typography page does not cover them. |

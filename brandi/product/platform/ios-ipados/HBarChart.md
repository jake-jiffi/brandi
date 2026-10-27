# HBarChart on iOS and iPadOS

A ranked top N on iOS is a horizontal bar chart with direct labels and values, read by VoiceOver as an ordered list.

```yaml
component: HBarChart
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
| Target and spacing | The plot itself is not pressed. Any control on it meets the 44 × 44 pt default [APL-1]. |
| Type | Labels and legends use text styles [APL-3]. Apple lets less important text hold its size as people enlarge text [APL-3], so axis text can grow less than the takeaway. Nothing under 11 pt [APL-1]. Direct labels keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | One colour, `series-1` by default, with every bar labelled, so colour carries nothing alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | `empty` when there is no data. Sorted descending, ten rows at most. A state change is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads it as an ordered list, each label with its value, grouped [APL-19]. The chart's description says what it ranks [APL-19]. |
| Navigation placement | On a surface in the content layer, inside its ChartFigure [APL-7]. |
| Keyboard, pointer, trackpad | Each row is static, so there is nothing to operate. On iPadOS a pointer annotation can show the exact value [APL-17]. |
| Haptics | None of its own. Apple names Audio graphs as a way to experience infographics on iOS and iPadOS [APL-1]. |
| Brand may change | Bar colour, height and the label layout. The rest of the ranking is "Other" or a link to the full table. Status colours stay for status [APL-4]. |
| Platform owns | Audio graphs [APL-1], VoiceOver navigation [APL-19] and Dynamic Type [APL-3]. |
| Not confirmed | The Swift Charts API, the chart descriptor behind Audio graphs, and Apple's chart guidance: the Charts and Charting data pages are not in the registry. |

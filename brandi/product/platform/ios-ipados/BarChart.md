# BarChart on iOS and iPadOS

Amounts across categories or days on iOS are a bar chart, grouped or stacked, with its takeaway in words for VoiceOver.

```yaml
component: BarChart
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
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Type | Labels and legends use text styles [APL-3]. Apple lets less important text hold its size as people enlarge text [APL-3], so axis text can grow less than the takeaway. Nothing under 11 pt [APL-1]. |
| Colour and theme | Series colours from the product's six slots, in fixed order. Direct labels and the legend name each series, never colour alone [APL-1]. Apple suggests letting people customise chart colours [APL-1]. Every colour needs light, dark and increased-contrast variants [APL-4]. |
| States | `loading`, a skeleton the chart's size, then `error` and `empty`. Missing data is a gap, never zero. A state change is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A concise description of what the chart shows, built from `title` and `summary` [APL-19]. Every interaction a sighted person has with it is open to VoiceOver too [APL-19]. iOS and iPadOS offer Audio graphs for infographics [APL-1]. Each bar reads its label and value. |
| Navigation placement | On a surface in the content layer, inside its ChartFigure [APL-7]. |
| Keyboard, pointer, trackpad | The product's arrow keys move through the points. On iPadOS a custom view can join the focus system as a focus group [APL-15]. With a pointer, an annotation can show the values under it, such as X and Y [APL-17]. |
| Haptics | None of its own. Apple names Audio graphs as a way to experience infographics on iOS and iPadOS [APL-1]. |
| Brand may change | Bar width, rounded data ends and the gaps between stacked parts, from the product's tokens. Stack only when the parts make a whole. One y-axis, and never a pie or donut chart. Status colours stay for status [APL-4]. |
| Platform owns | Audio graphs [APL-1], VoiceOver navigation [APL-19] and Dynamic Type [APL-3]. |
| Not confirmed | The Swift Charts API, the chart descriptor behind Audio graphs, and Apple's chart guidance: the Charts and Charting data pages are not in the registry. |

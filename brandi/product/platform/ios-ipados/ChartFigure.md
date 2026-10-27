# ChartFigure on iOS and iPadOS

A chart's frame on iOS: a heading that names it, the takeaway in one sentence, the chart, and the same numbers in a form VoiceOver can read.

```yaml
component: ChartFigure
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest pattern is a titled region holding a chart and its description [APL-19]. |
| Target and spacing | The plot itself is not pressed. Any control on it meets the 44 × 44 pt default [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The heading and the takeaway grow with Dynamic Type, and stay the most important text [APL-3]. |
| Colour and theme | Charts sit on a surface, since the series colours are checked at 3:1 against it. Every colour needs light, dark and increased-contrast variants [APL-4]. |
| States | As its chart: loading, error and empty, each reported to VoiceOver [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The heading takes `isHeader` or `.header` [APL-23] [APL-29]. The takeaway is the chart's description [APL-19]. The numbers stay reachable to VoiceOver, which is what the web's hidden table does [APL-19]. Support the rotor where it helps [APL-19]. |
| Navigation placement | In the content layer, on a surface [APL-7]. |
| Keyboard, pointer, trackpad | The product's arrow keys move through the points. On iPadOS a custom view can join the focus system as a focus group [APL-15]. With a pointer, an annotation can show the values under it, such as X and Y [APL-17]. |
| Haptics | None of its own. Apple names Audio graphs as a way to experience infographics on iOS and iPadOS [APL-1]. |
| Brand may change | The heading, the takeaway's wording and the surface. The takeaway says what the numbers mean in one sentence. Status colours stay for status [APL-4]. |
| Platform owns | Audio graphs [APL-1], VoiceOver navigation [APL-19] and Dynamic Type [APL-3]. |
| Not confirmed | The Swift Charts API, the chart descriptor behind Audio graphs, and Apple's chart guidance: the Charts and Charting data pages are not in the registry. How to give VoiceOver the full data set without a hidden table. |

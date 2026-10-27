# MetricCard on macOS

MetricCard is a headline figure with its label, delta and trend on macOS, built as a card with a hint behind an info button.

```yaml
component: MetricCard
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | None in the registry. A card in the content layer [APL-7] holding a figure, a delta, a sparkline and an info button that opens a popover, which Apple names as its own component [APL-12]. |
| Target and spacing | The info button meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | The figure in a title style, such as Large Title 26 pt or Title 1 22 pt [APL-3], shrinking with the card. Label and footnote never under 10 pt [APL-1]. Tabular figures. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The delta's colour always has words beside it [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Ready, loading and unavailable. Unavailable says when the source last answered, never a zero nobody measured. Apple's own pattern for a missing connection is cached data with a non-intrusive label [APL-13]. |
| Motion | A loading skeleton stops shimmering under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads label, value and delta as one group [APL-19]. The info button has trait `isButton` and a label [APL-23] [APL-19]. A sparkline without a label is hidden [APL-19]. |
| Navigation placement | In a row of cards in the content layer, on standard materials, one hero per row [APL-7]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the info button [APL-16]. Esc cancels and closes the hint [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Figure size, the hero card, the hint and the number formats. Apple asks that a chart carry a concise description for VoiceOver [APL-19]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The popover API and its behaviour for the hint: Apple's popover page is not in the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

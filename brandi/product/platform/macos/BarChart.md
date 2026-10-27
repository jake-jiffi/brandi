# BarChart on macOS

BarChart shows amounts across categories or days on macOS, drawn by the product, since the registry has no chart page.

```yaml
component: BarChart
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | Not confirmed. The registry holds no chart framework and no Apple page on charts. The product draws its own chart, and Apple asks that charts and other infographics be fully accessible [APL-19]. |
| Target and spacing | None for bars. The plot is one focusable element. Controls round it meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Axis text, labels and the legend in SF Pro, never under 10 pt [APL-3] [APL-1]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Series colours `series-1` to `series-6`, in that order, each checked in both appearances and under Increase Contrast [APL-4]. Never colour alone: direct labels or a legend name each series [APL-1]. Apple suggests letting people customise chart colours [APL-1]. Comparisons are grey and dashed. |
| States | Loading, empty, error and ready. Missing data is skipped, never drawn as zero. When a source is down, Apple's own pattern is cached data with a non-intrusive label [APL-13]. |
| Motion | Any bar animation stops under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. A concise description of what the chart conveys, built from `title` and `summary`, and the numbers as a table [APL-19]. Any interaction, such as stepping through points, works for VoiceOver too [APL-19]. |
| Navigation placement | In a card in the content layer, on a standard material [APL-7]. |
| Keyboard, pointer, trackpad | The plot takes focus as one element under Full Keyboard Access [APL-16]. Left, Right, Home and End move through the points, the product's key map. Apple keyboard guidance for charts: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Series colours, bar width, rounded ends, gaps and labels. Apple asks that charts be fully accessible [APL-19] and suggests colours people can change [APL-1]. |
| Platform owns | How VoiceOver reads the description [APL-19]. |
| Not confirmed | A native chart control, Apple's chart guidance, and a key map for charts on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

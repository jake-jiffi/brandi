# ShareBar on macOS

ShareBar shows shares of a whole as one segmented bar on macOS, with a legend that prints every share, in place of pie and donut charts.

```yaml
component: ShareBar
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
| Target and spacing | None. The bar is read, not pressed. |
| Type | Axis text, labels and the legend in SF Pro, never under 10 pt [APL-3] [APL-1]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Series colours `series-1` to `series-6`, in that order, each checked in both appearances and under Increase Contrast [APL-4]. Never colour alone: direct labels or a legend name each series [APL-1]. Apple suggests letting people customise chart colours [APL-1]. |
| States | Ready and empty. Zero and negative values are left out. Apple guidance on chart states: not confirmed. |
| Motion | Any animation stops under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. A concise description of the split, with each share read as words in the legend [APL-19]. |
| Navigation placement | In a card in the content layer, on a standard material [APL-7]. |
| Keyboard, pointer, trackpad | None. The legend prints every share, so nothing needs focus. |
| Haptics | None [APL-18]. |
| Brand may change | Segment colours and the legend. Apple asks that charts be fully accessible [APL-19]. |
| Platform owns | How VoiceOver reads the description [APL-19]. |
| Not confirmed | A native chart control, Apple's chart guidance, and a key map for charts on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

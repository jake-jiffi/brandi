# ChartFigure on macOS

ChartFigure is a chart's frame on macOS: a heading, the takeaway in one sentence, the chart, and the same numbers as a table.

```yaml
component: ChartFigure
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The registry names no figure control. The frame carries what Apple asks of every chart: a concise description of what it conveys [APL-19]. |
| Target and spacing | None of its own. The chart inside is one focusable element. |
| Type | Heading in Title 3 or Headline, takeaway in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Charts sit on a surface, since the series colours are checked at 3:1 against it. Every surface colour needs light, dark and increased-contrast variants [APL-4]. |
| States | As the chart inside: loading, empty, error and ready. Apple guidance on chart states: not confirmed. |
| Motion | None of its own. The chart follows Reduce Motion [APL-1]. |
| Accessibility API | VoiceOver. The heading names the figure for the rotor [APL-19]. The takeaway is the chart's description. The table carries every number, its first column naming each row, so the data is reachable as well as the summary [APL-19]. |
| Navigation placement | In a card in the content layer, on a standard material [APL-7]. |
| Keyboard, pointer, trackpad | The chart takes focus under Full Keyboard Access [APL-16]. Apple keyboard guidance for charts: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Heading level, takeaway wording and the table's columns. Apple asks for a concise description of every infographic [APL-19]. |
| Platform owns | Rotor navigation by heading [APL-19]. |
| Not confirmed | A native figure or chart container. How a visually hidden table is exposed to VoiceOver on macOS. A key map for charts on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

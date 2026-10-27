# DescriptionList on macOS

DescriptionList shows label and value pairs for a record on macOS, with no native control in the registry.

```yaml
component: DescriptionList
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | None in the registry. Label and value text in two columns. The nearest pattern it covers is a two-column table [APL-14]. |
| Target and spacing | None. Text is not a target. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Labels in `secondaryLabelColor`, values in `labelColor` [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | No states. A missing value says "Not set". |
| Motion | None. |
| Accessibility API | VoiceOver reads each label with its value, so group each pair [APL-19]. |
| Navigation placement | In a detail pane, or an inspector opened from the toolbar's trailing section [APL-11]. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Columns or stacked layout, and the label colour. Apple guidance on label and value pairs: not confirmed. |
| Platform owns | Dynamic label colours [APL-4]. |
| Not confirmed | A native label and value layout. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

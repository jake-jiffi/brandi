# MultiSelect on macOS

MultiSelect picks several options on macOS and shows them as removable tokens, a control the registry has no page for.

```yaml
component: MultiSelect
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | Not confirmed. The registry has no page on token fields. The closest pattern it covers is a list of options that adds a checkmark to each chosen row [APL-14]. |
| Target and spacing | Each token's remove button meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Tokens and input in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Chosen options carry a checkmark, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Empty, with tokens, open and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | Tokens appear and go with a fade under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each remove button is named "Remove [value]", with trait `isButton` [APL-19] [APL-23]. Chosen options carry `isSelected` [APL-23]. |
| Navigation placement | In a form or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each remove button [APL-16]. Backspace in the empty input removes the last token, the product's rule. The native behaviour: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Token style and the list. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The token field control, its API and its keyboard behaviour. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

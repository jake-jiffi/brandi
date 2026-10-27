# FormRow on macOS

FormRow puts two or three short fields side by side on macOS, with no native control in the registry.

```yaml
component: FormRow
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | None in the registry. It is a row of system text fields [APL-5]. |
| Target and spacing | Fields keep the 28 × 28 pt default and the 20 × 20 pt minimum, about 12 pt apart when bezelled [APL-1]. |
| Type | Labels in `labelFont(ofSize:)` [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Each field's own colours [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | No states of its own. |
| Motion | None. Dropping to one column is a layout change, not an animation. |
| Accessibility API | VoiceOver reads the fields in reading order, leading to trailing, then down [APL-19]. |
| Navigation placement | Inside a FormSection, in a window or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Tab moves through the fields in reading order, Shift-Tab back [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Columns, and the width at which it drops to one column. Apple guidance on form rows: not confirmed. |
| Platform owns | Reading order for VoiceOver [APL-19]. |
| Not confirmed | Form layout guidance for macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

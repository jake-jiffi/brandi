# TextArea on macOS

TextArea is a system text view on macOS, for multi-line notes and messages.

```yaml
component: TextArea
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
| Native control | A system text view, which Apple asks apps to use rather than drawing text themselves [APL-5]. The text view API is not in the registry. |
| Target and spacing | The view is its own target. Anything pressable in it meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Document text uses `userFont(ofSize:)` [APL-3]. Avoid tight leading on three or more lines [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Text in `textColor` on `textBackgroundColor`, with `placeholderTextColor` for a placeholder [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Rest, focused, invalid and unavailable. A text view takes a focus ring [APL-15]. Invalid styling: not confirmed. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The label says what the text is for [APL-19]. A character count, shown only with a hard limit, reads with the field [APL-19]. |
| Navigation placement | In a form or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Standard editing shortcuts apply, from Command-A to Command-Z [APL-16]. Option-Shift with an arrow extends the selection by word or paragraph [APL-16]. The I beam pointer shows over text [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | Starting height, vertical resize and the label. Apple asks for system-drawn text views [APL-5]. |
| Platform owns | Text selection and editing shortcuts [APL-16]. Selection colours [APL-4]. The I beam pointer [APL-17]. |
| Not confirmed | The text view API. Whether Tab moves focus out of a text view or types a tab. Resize behaviour. Invalid styling. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

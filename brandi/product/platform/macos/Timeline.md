# Timeline on macOS

Timeline lists what happened to a record on macOS, newest first, with no native control in the registry.

```yaml
component: Timeline
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
| Native control | None in the registry. A list of lines, each with an icon and a time [APL-14]. |
| Target and spacing | None. Lines are read, not pressed. |
| Type | Body 13 pt, the time in Footnote, 10 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The assistant's lines use the `ai` tone, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | No states. |
| Motion | None. |
| Accessibility API | VoiceOver reads each line with its time, so group them [APL-19]. |
| Navigation placement | In a record's detail view [APL-14]. |
| Keyboard, pointer, trackpad | None. Lines take no focus [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Icons by kind, tones and wording. Apple guidance on activity timelines: not confirmed. |
| Platform owns | Dynamic colours [APL-4]. |
| Not confirmed | A native timeline pattern. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

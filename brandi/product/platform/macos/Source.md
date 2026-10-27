# Source on macOS

Source is a citation chip under an answer on macOS: where a figure came from, linking to it.

```yaml
component: Source
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
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
| Native control | None in the registry. A link styled as a chip, in `linkColor` or a chip style, under the pointing-hand pointer [APL-4] [APL-17]. |
| Target and spacing | It meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Label in Callout 12 pt or Subheadline 11 pt, never under 10 pt [APL-3] [APL-1]. |
| Colour and theme | Never colour alone: the icon and label say it is a source [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Rest and hover, with the pointing hand [APL-17]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The label names the source. Links are a rotor category [APL-19]. |
| Navigation placement | Under the answer, beside the figure it supports. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each source [APL-16]. Primary click opens it [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | Chip shape, icon and label. Apple asks for the system link colour on links and no similar colour on text that does not act [APL-4]. |
| Platform owns | The pointing-hand pointer [APL-17]. |
| Not confirmed | The link trait for VoiceOver. Placement guidance for citations. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

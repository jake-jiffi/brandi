# RuleLine on macOS

RuleLine shows which approved rule acted, on macOS: one plain line with one link.

```yaml
component: RuleLine
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
| Native control | None in the registry. A line of text with a link in `linkColor` [APL-4]. |
| Target and spacing | The link meets the 28 × 28 pt default and the 20 × 20 pt minimum where it can [APL-1]. |
| Type | Body or Callout [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The link in `linkColor` [APL-4]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Acted, failed, and changed or paused since, each in words [APL-1]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver reads the line, and the link is a rotor stop [APL-19]. |
| Navigation placement | On the item the rule changed, in its history and in the steps log. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the link [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Wording. Apple asks for the system link colour on links [APL-4]. |
| Platform owns | The pointing-hand pointer over the link [APL-17]. |
| Not confirmed | The link trait for VoiceOver. Placement guidance for the line. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

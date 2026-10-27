# Badge on macOS

Badge is one or two words of state on a record on macOS, unlike the tab bar's red count, the only native badge in the registry.

```yaml
component: Badge
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
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
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
| Native control | None for a word of state. The registry's only badge is the tab bar's: a red oval with white text and a number or exclamation point, kept for critical information [APL-9]. The product's Badge is a different thing. |
| Target and spacing | None. A badge is read, not pressed. |
| Type | SF Pro, never under 10 pt [APL-3] [APL-1]. Sentence case, no full stop. |
| Colour and theme | Each tone needs light, dark and increased-contrast variants [APL-4]. The word carries the meaning, never colour alone [APL-1]. One colour, one meaning: "needs you" stays apart from "warning" [APL-4]. |
| States | No interactive states. A long label truncates, with the full text on hover. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver reads the word with the record it describes, so group them [APL-19]. |
| Navigation placement | On the record it describes, grouped with it for VoiceOver [APL-19]. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Tones, icons, dots and words. Apple keeps the red badge for critical information [APL-9]. The product's danger tone stays a word on a record. |
| Platform owns | Dynamic colour switching [APL-4]. |
| Not confirmed | Showing the full text of a truncated badge on hover: the registry covers tooltips on buttons only. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

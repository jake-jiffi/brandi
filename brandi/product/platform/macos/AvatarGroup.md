# AvatarGroup on macOS

AvatarGroup shows overlapping avatars with a "+N" count on macOS, with no native control in the registry.

```yaml
component: AvatarGroup
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-2
    url: https://developer.apple.com/design/human-interface-guidelines/buttons
    marker: 2025-12-16
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
| Native control | None. The registry names no avatar group. It is a row of images with a count, read as one element [APL-19]. |
| Target and spacing | The "+N", when it opens a list, meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | The "+N" count in SF Pro, never under 10 pt [APL-3] [APL-1]. |
| Colour and theme | Each avatar's tint in light, dark and increased-contrast variants [APL-4]. |
| States | No states, apart from hover on the "+N". macOS shows a tooltip after a short hover on a button [APL-2]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. Group it so it reads as one element naming everyone [APL-19]. The "+N" names the hidden people [APL-19]. |
| Navigation placement | On a record's header or row, the product's placement. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | The "+N" is reachable under Full Keyboard Access when it acts [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Overlap, `max`, size and the "+N" style. Apple guidance for avatar groups: not confirmed. |
| Platform owns | Tooltip timing on hover [APL-2]. |
| Not confirmed | A native avatar group. Tooltips on anything but a button. Placement guidance for avatar groups. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

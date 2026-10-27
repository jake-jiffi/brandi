# Avatar on macOS

Avatar has no native control on macOS: it is a photo or initials in a circle, always beside the person's name.

```yaml
component: Avatar
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
| Native control | None. The registry names no avatar control. It is an image with a label [APL-19]. |
| Target and spacing | None alone. In a button, the control sizes apply: 28 × 28 pt default, 20 × 20 pt minimum [APL-1]. |
| Type | Initials in SF Pro [APL-3]. |
| Colour and theme | Tint colours need light, dark and increased-contrast variants [APL-4]. Online, away and offline never rest on colour alone [APL-1]. |
| States | No interactive states. A status dot for online, away or offline. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The label is the name with the status: "[Name], online" [APL-19]. Group it with the name beside it so it reads once [APL-19]. |
| Navigation placement | Beside the person's name, grouped with it [APL-19]. |
| Keyboard, pointer, trackpad | None. Not focusable alone [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Sizes, tints, initials and the status dot. The circle is the product's one shape exception. Apple avatar guidance: not confirmed. |
| Platform owns | Dynamic colour switching with the appearance [APL-5]. |
| Not confirmed | A native avatar or contact image control. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

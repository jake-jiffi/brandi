# Spacer on macOS

Spacer is a flexible gap in a toolbar on macOS that pushes what follows to the far end.

```yaml
component: Spacer
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Toolbar space. Apple asks apps to pin items to the leading edge, centre or trailing edge, and to insert space between items where it helps [APL-11]. The macOS API for it is not in the registry. |
| Target and spacing | None. A gap is not a target. |
| Type | None. It holds no text. |
| Colour and theme | None. It draws nothing. |
| States | No states. |
| Motion | None. |
| Accessibility API | None. It is not an accessibility element. |
| Navigation placement | Inside a Toolbar, between filters and the view controls [APL-11]. |
| Keyboard, pointer, trackpad | None. Not focusable [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Nothing. It has no style to change [APL-11]. |
| Platform owns | Toolbar layout as the window resizes [APL-11]. |
| Not confirmed | The flexible space API on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

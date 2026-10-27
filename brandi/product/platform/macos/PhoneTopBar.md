# PhoneTopBar on macOS

PhoneTopBar does not ship on macOS: on a Mac, the window's toolbar carries Back and the title.

```yaml
component: PhoneTopBar
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | None. It is a phone component. On macOS, the toolbar's leading edge holds the back control and the view title [APL-11]. |
| Target and spacing | Toolbar items meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Title in `titleBarFont(ofSize:)`, under 15 characters [APL-3] [APL-11]. |
| Colour and theme | The toolbar floats on Liquid Glass [APL-7]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Not applicable. Toolbar symbols get hover and selection appearances from the system [APL-11]. |
| Motion | None on macOS [APL-6]. |
| Accessibility API | VoiceOver. The window title is read first [APL-19]. Back uses the standard symbol, never a text label [APL-11]. |
| Navigation placement | The toolbar in the window frame [APL-11]. |
| Keyboard, pointer, trackpad | Control-F5 moves focus to the toolbar [APL-16]. After navigating, focus moves to the new view's content, the product's rule. |
| Haptics | None [APL-18]. |
| Brand may change | Nothing on macOS beyond the toolbar's rules. Apple asks for the standard Back button, with its symbol rather than the word "Back" [APL-11]. |
| Platform owns | The toolbar's leading edge, which people cannot customise [APL-11]. |
| Not confirmed | Whether list and detail ever collapse to one view on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

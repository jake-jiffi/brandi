# Combobox on macOS

Combobox picks one option from a long or searchable list on macOS, a control the registry has no page for.

```yaml
component: Combobox
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Not confirmed. The registry has no page on combo boxes. The closest patterns it covers: a pop-up button for a short list [APL-2], and a search field with matches below it [APL-11]. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Input in Body 13 pt, options in `menuFont(ofSize:)` [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Typed text in `textColor` on `textBackgroundColor`, the option in hand in `selectedMenuItemTextColor` [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Closed, open, typing, option in hand, no match and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. With no match it says so and keeps what was typed. |
| Motion | Any list animation follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The field takes its Field's name [APL-19]. Report the active option as it changes with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In a form or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | The field takes keyboard focus with a ring [APL-15]. Esc cancels [APL-16]. Arrow keys through the list: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Matching, the empty line and the list's look. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The focus ring [APL-15]. Text editing shortcuts [APL-16]. |
| Not confirmed | The combo box control, its API and its keyboard behaviour. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# SignInFields on macOS

SignInFields are a password with show and hide, and a one-time code, on macOS.

```yaml
component: SignInFields
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A secure text field for the password [APL-13], and system text fields for the code [APL-5]. The show and hide toggle is an image button [APL-2]. |
| Target and spacing | Fields and the toggle meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Text in `textColor` on `textBackgroundColor` [APL-4]. An error has an icon, never colour alone [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Hidden, shown, focused, invalid and unavailable. Focus is a ring [APL-15]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. The toggle is named for what it does ("Show password"), with trait `isButton` [APL-19] [APL-23]. A code reads as one field [APL-19]. |
| Navigation placement | In the sign-in window or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Command-V pastes, and a standard shortcut is never taken away [APL-16]. Fields take focus with a ring [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Toggle wording and the code's layout. Never block paste, which keeps Apple's standard Command-V working [APL-16]. |
| Platform owns | Standard editing shortcuts [APL-16]. The secure text field [APL-13]. |
| Not confirmed | Password AutoFill and one-time code filling on macOS: no registry page covers them. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

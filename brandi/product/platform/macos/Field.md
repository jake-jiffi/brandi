# Field on macOS

Field is a label with its control, hint and error on macOS, built from a text label and the control it names.

```yaml
component: Field
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
| Native control | None as one control. A label in `labelFont(ofSize:)` [APL-3] above the control it names. The registry has no form layout page. |
| Target and spacing | The control inside meets the 28 × 28 pt default and the 20 × 20 pt minimum, with about 12 pt between bezelled controls [APL-1]. |
| Type | Label in `labelFont(ofSize:)` [APL-3], in sentence case with no colon. Hint and error never under 10 pt [APL-1]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Label in `labelColor`, hint in `secondaryLabelColor` [APL-4]. An error carries an icon as well as colour [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Default, optional, required, invalid and unavailable. An unavailable control's text takes `disabledControlTextColor` [APL-4]. The error appears when the person leaves the field or saves, never while they type. |
| Motion | None of its own. An error appears in place, and any transition follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The label names the control. Group label, control, hint and error so they read together [APL-19]. Report the error when it appears with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In a form, in a window or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | The control takes focus, and a text field shows the focus ring [APL-15]. Tab moves between fields, Shift-Tab back [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Label above the control, the optional marker, and hint and error wording, all in sentence case. No Apple page in the registry sets form labels. The error icon keeps meaning off colour alone, as Apple asks [APL-1]. |
| Platform owns | The focus ring on text fields [APL-15]. Tab order [APL-16]. |
| Not confirmed | Apple's form layout and label placement for macOS. Hint and error styling. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

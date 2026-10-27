# NumberInput on macOS

NumberInput sets a quantity or amount with step buttons on macOS, a control the registry has no page for.

```yaml
component: NumberInput
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | Not confirmed. The registry has no page on a control that steps a value. The closest pattern it covers: a system text field [APL-5] with two image buttons [APL-2]. |
| Target and spacing | Step buttons meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | Body 13 pt, tabular figures [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Rest, focused, invalid and unavailable. A step button goes unavailable at a limit, its text in `disabledControlTextColor` [APL-4]. A typed value is checked when the person leaves the field. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. Step buttons are named by what they change ("Increase quantity"), with trait `isButton` [APL-19] [APL-23]. The field reads its value with any prefix or suffix [APL-19]. |
| Navigation placement | In a form, a sheet or a row [APL-12]. |
| Keyboard, pointer, trackpad | The field takes focus with a ring [APL-15]. Up and Down step the value, the product's rule. The native behaviour: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Step size, limits, prefix and suffix. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The focus ring [APL-15]. |
| Not confirmed | A native step control and its keyboard behaviour. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

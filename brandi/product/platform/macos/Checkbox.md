# Checkbox on macOS

Checkbox is a checkbox on macOS, the same control Apple uses for an alert's suppression option.

```yaml
component: Checkbox
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | A checkbox. Apple's Alerts page uses one for the option that suppresses a repeating alert [APL-13]. The checkbox API and its own guidance are not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt, with about 12 pt of padding around a bezelled control and about 24 pt around one without a bezel [APL-1]. |
| Type | Label in `controlContentFont(ofSize:)` [APL-3], stating the outcome, in sentence case. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A custom checkbox draws its checked surface in `selectedControlColor` [APL-4]. The check mark carries the state, never colour alone [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Whether the accent colours a checkbox: not confirmed. |
| States | Checked, unchecked, mixed and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. The mixed state's drawing: not confirmed. |
| Motion | None of its own. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the label and the checked state [APL-19]. The mixed-state API: not confirmed. |
| Navigation placement | In a form, or as an alert's suppression checkbox [APL-13]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches it [APL-16]. The key that toggles it: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Box size and the check's colour. A setting that applies at once is a Switch. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. Selected-control colours per appearance [APL-4]. |
| Not confirmed | The checkbox API, the mixed state and the toggling key. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Stepper on macOS

Stepper shows progress through a short setup on macOS, a check on finished steps and a ring on the current one, with no native control in the registry.

```yaml
component: Stepper
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
| Native control | None in the registry. Apple suggests a new window for a complex or long flow on macOS, rather than a sheet [APL-12]. In a multi-step sheet, a Back button returns to the previous step [APL-12]. |
| Target and spacing | Finished steps that can be revisited meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Step labels in Body 13 pt, each naming an outcome [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A check for finished, a ring for current, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Completed, current and not started. Finished steps can be revisited, as a Back button allows in a multi-step sheet [APL-12]. |
| Motion | Moving to the next step fades under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads each label with its state: "Completed", "Current step" or "Not started" [APL-19]. |
| Navigation placement | In a setup window, which Apple suggests for a long flow [APL-12]. Its position there: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the finished steps [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Orientation, the check and the ring, five steps at most. Apple guidance on showing setup progress: not confirmed. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | A native setup assistant pattern. Whether a macOS control of the same name means something else. Where progress sits in a setup window. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

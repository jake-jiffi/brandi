# AISteps on macOS

AISteps shows what the assistant is doing, step by step, on macOS: open while it works, folded to one line when done.

```yaml
component: AISteps
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
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
| Native control | None in the registry. The summary line works as a disclosure control, which Apple uses to fold long content in sidebars [APL-10]. |
| Target and spacing | The summary line meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Step labels in Body 13 pt, details in Callout 12 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Each step says its state in words, never colour alone [APL-1]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Done, running, waiting, failed and skipped, for each step. The run as a whole: working, finished, failed or stopped. Each state is a word, never colour alone [APL-1]. |
| Motion | One spinner at a time, slowed under reduced motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The summary line has trait `isButton` [APL-23]. Its expanded state: not confirmed. The start, a failure and the end are reported with `AccessibilityNotification`, never every change [APL-19]. |
| Navigation placement | Inside an AIAnswer, or alone in a Card titled with the job's name. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the summary line and Try again [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Step wording and the folded title. Apple disclosure guidance beyond sidebars: not confirmed. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | The disclosure control API and how it reports its state. Placement guidance for a steps log. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

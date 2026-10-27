# Thinking on macOS

Thinking is the assistant's working line on macOS: a small spinner, then what it is doing.

```yaml
component: Thinking
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
| Native control | None in the registry. Text with a small indeterminate indicator. The registry has no page on progress indicators. |
| Target and spacing | None. Not a target. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Working, then replaced by the steps or the answer. Report the change with `AccessibilityNotification` [APL-19]. |
| Motion | The spinner slows right down under reduced motion, where Apple asks for less repeating animation [APL-1]. The product's rule applies (2.3). No pulsing dots. |
| Accessibility API | VoiceOver. A polite status by default, reported with `AccessibilityNotification` when the work changes [APL-19]. The spinner is hidden [APL-19]. |
| Navigation placement | In the answer, in the same shape as the AISteps summary line. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None. It takes no focus [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Wording, such as "Reading 12 [records]". Apple guidance on assistant status: not confirmed. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | The progress indicator control. Announcement priority. Placement guidance. Apple guidance on assistant status. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Conversation on macOS

Conversation shows messages between people, and a composer, on macOS, with no native control in the registry.

```yaml
component: Conversation
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | None in the registry. A list of messages [APL-14] above a system text view for the composer [APL-5]. |
| Target and spacing | Send and message actions meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Messages in Body 13 pt, names and times in Callout or Footnote [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The assistant's messages carry the `ai` tone, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Unread, read, sending, sent and failed. Unread shows a dot, never colour alone [APL-1]. |
| Motion | New messages appear without sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Every message names who sent it and when, grouped together [APL-19]. A new message is reported once with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In a pane of the window, or in its own window [APL-12]. |
| Keyboard, pointer, trackpad | The composer takes focus with a ring [APL-15]. Return sends and Shift-Return adds a line, the product's rule. Text editing shortcuts keep their meaning [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Message style, grouping and the composer. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Text editing shortcuts [APL-16]. |
| Not confirmed | A native conversation view. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

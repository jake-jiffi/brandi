# Conversation on iOS and iPadOS

Messages between people on iOS are a scrolling list of messages with a composer below, each message naming who sent it and when.

```yaml
component: Conversation
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest pattern is a list of messages [APL-14], with a system text view as the composer [APL-5]. |
| Target and spacing | Send and the message actions keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Long messages never take tight leading [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | Who sent a message shows by name and position as well as colour [APL-1]. The assistant's messages carry the `ai` tone, a colour kept for that one meaning [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Sending, sent, failed and unread. An unread message shows a dot and says "(unread)" to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Each message groups its sender, time and text [APL-19]. A new message posts one `AccessibilityNotification` [APL-19]. |
| Navigation placement | A detail view: beside the list of conversations on iPad [APL-10], its own screen on iPhone. |
| Keyboard, pointer, trackpad | iPadOS includes text views in its focus system [APL-16] [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | Not confirmed: no registry page covers haptics for a received message. |
| Brand may change | Bubble shapes, colours, and the composer's label, which says what the text is for. A restyle keeps familiar behaviour [APL-8]. |
| Platform owns | Text editing and the I-beam pointer [APL-17]. |
| Not confirmed | Keeping the composer above the keyboard, and sending on Return: no registry page covers them. Haptics for a received message. |

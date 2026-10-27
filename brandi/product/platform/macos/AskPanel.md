# AskPanel on macOS

AskPanel holds the assistant's thread, empty state and composer on macOS, in a panel or its own window.

```yaml
component: AskPanel
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None in the registry. The closest patterns: an inspector opened from the toolbar's trailing edge [APL-11], a panel when people keep working beside it [APL-12], or a separate window [APL-12]. |
| Target and spacing | Send, Stop and the suggestions meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | The thread in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Liquid Glass's regular variant suits text-heavy surfaces such as sidebars and popovers [APL-7]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Empty, replying, done, stopped and failed. Send becomes Stop while an answer runs. Send stays the one prominent button unless a proposal waits [APL-2]. |
| Motion | Replies arrive without sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each answer reports its own status changes with `AccessibilityNotification` [APL-19]. The thread itself is not announced. Header buttons carry their own labels [APL-19]. |
| Navigation placement | The trailing side of the window, opened from the toolbar [APL-11], or its own window [APL-12]. |
| Keyboard, pointer, trackpad | Return sends and Shift-Return adds a line, the product's rule. Control-F6 moves focus to the panel [APL-16]. After Send, focus moves to the new answer, following the person's press [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Greeting, suggestions and layout. Up to three suggestions as quiet buttons, so the one prominent button stays the next move [APL-2]. |
| Platform owns | Panel focus with Control-F6 [APL-16]. |
| Not confirmed | The inspector and panel APIs. Apple guidance on assistant panels. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

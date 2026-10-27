# NotificationCentre on macOS

NotificationCentre is the signed-in person's events inside the product on macOS, separate from the system's Notification Center.

```yaml
component: NotificationCentre
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
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
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
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
| Native control | None in the registry. The system's Notification Center opens with a swipe from the trackpad's edge [APL-17] and belongs to the system, not the app. The closest in-app pattern is a popover [APL-12] from a toolbar button [APL-11]. |
| Target and spacing | The trigger and each event meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt, times in Footnote, 10 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Counts in the highlight when they wait on the reader, grey otherwise, never colour alone [APL-1]. Apple keeps red badges for critical information [APL-9]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Closed, open, unread and read. Unread carries a dot, never colour alone [APL-1]. Zero shows nothing. |
| Motion | It opens without a slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The trigger's label includes the count in words [APL-19]. Unread events say "(unread)" [APL-19]. |
| Navigation placement | From a toolbar button at the trailing edge [APL-11], or from the sidebar. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the trigger and each event [APL-16]. Esc cancels and closes it [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Grouping, the assistant's `ai` tone and counts. Apple keeps red badges for critical information [APL-9]. |
| Platform owns | The system's Notification Center, which belongs to the system [APL-17]. |
| Not confirmed | Apple's notification guidance, which the Tab bars page points to [APL-9] and the registry lacks. The popover API. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

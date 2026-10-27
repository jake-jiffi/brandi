# ToastRegion on iOS and iPadOS

The queue that shows, times and pauses toasts on iOS keeps them above the bottom bars, one at a time.

```yaml
component: ToastRegion
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
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. Apple asks apps to keep time-boxed elements to a minimum and to prefer explicit dismissal [APL-1]. |
| Target and spacing | Each toast's buttons keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Empty, showing and paused. Apple prefers explicit dismissal to a timer [APL-1]. The product's timing is under Brand may change. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Each toast posts one `AccessibilityNotification` [APL-19]. The region itself reads nothing. |
| Navigation placement | Above the bottom bars, which stay visible [APL-9]. On iPhone Duo it moves clear of reserved regions with `ReservedRegion` or `UIView.ReservedRegion` [APL-20]. |
| Keyboard, pointer, trackpad | Apple's standard shortcut for Undo is Command-Z [APL-16]. |
| Haptics | A notification haptic can report the outcome [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | Timing and stacking: 5 seconds, or 8 with Undo, paused while hovered or focused. That timer departs from Apple's preference for explicit dismissal [APL-1]. The product's guidelines apply (2.3). |
| Platform owns | Reserved regions on iPhone Duo [APL-20]. |
| Not confirmed | Timing that suits VoiceOver users: no registry page sets one. |

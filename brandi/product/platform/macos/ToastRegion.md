# ToastRegion on macOS

ToastRegion is the queue that shows, times and pauses toasts on macOS, with no native control in the registry.

```yaml
component: ToastRegion
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
| Native control | None in the registry. Apple asks apps to minimise views that dismiss on a timer [APL-1]. |
| Target and spacing | The region is not a target. Toasts inside meet the 28 × 28 pt default [APL-1]. |
| Type | Each toast's own type, Body 13 pt [APL-3]. |
| Colour and theme | Each toast's own colours [APL-4]. |
| States | Empty, showing one, and queued. 5 seconds, or 8 with Undo, paused while hovered or focused. Apple prefers views people dismiss themselves [APL-1]. |
| Motion | Toasts fade rather than slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each toast is reported once with `AccessibilityNotification` [APL-19]. Timed views are hard for assistive technology users [APL-1]. |
| Navigation placement | Bottom centre of the window, the product's placement. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Command-Z undoes the last action without reaching the toast [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Timing, order and the pause. Apple asks apps to minimise timed views [APL-1]. The product's guidelines apply (2.3). |
| Platform owns | Command-Z undo [APL-16]. |
| Not confirmed | A native queue for in-window notices. Placement guidance for the queue. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Button on iOS and iPadOS

The primary button, from the platform reference's worked example.

```yaml
component: Button
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
```

| Field | Spec |
|---|---|
| Native control | SwiftUI `Button` with a prominent style [APL-2]. Give it the primary role, never on a destructive action [APL-2]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so the label follows Dynamic Type [APL-3]. In the product's case [APL-2]. |
| Colour and theme | The prominent style puts the app accent on the background [APL-2] [APL-4]. |
| States | Always draw a press state on a custom button [APL-2]. Disabled styling: not confirmed. |
| Motion | Under Reduce Motion, cut automatic animation and swap slides for fades [APL-1]. |
| Accessibility API | VoiceOver reads the visible title as the label [APL-2]. |
| Navigation placement | In a toolbar, one prominent action on the trailing side [APL-2]. |
| Keyboard, pointer, trackpad | Return activates the primary button [APL-2]. |
| Haptics | Not confirmed. |
| Brand may change | The accent colour on the prominent background and the label wording [APL-4] [APL-2]. |
| Platform owns | Sizes and placement in bars [APL-2]. |
| Not confirmed | Disabled styling. Whether standard buttons play a haptic. |

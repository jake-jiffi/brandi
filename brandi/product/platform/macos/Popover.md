# Popover on macOS

Popover is a non-modal panel anchored to a control on macOS, a component Apple names on its Sheets page.

```yaml
component: Popover
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
| Native control | A popover, which Apple names as a related component on its Sheets page [APL-12]. Its own page is not in the registry, so the API is not confirmed here. |
| Target and spacing | Controls inside meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Liquid Glass's regular variant suits components with a lot of text, such as popovers [APL-7]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Open and closed. How macOS draws the anchor: not confirmed. |
| Motion | System presentation motion [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Report it opening with `AccessibilityNotification` [APL-19]. Focus returns to the trigger when it closes, after the person's own action [APL-15]. |
| Navigation placement | Anchored to the control that opened it, flipping to stay on screen, the product's rule. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Esc, which cancels the current action, closes it [APL-16]. Full Keyboard Access reaches its controls [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Content, size and anchor. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The regular Liquid Glass variant most system components use [APL-7]. |
| Not confirmed | The popover API, its arrow and its dismissal rules. Placement guidance for a popover. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

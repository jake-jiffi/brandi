# Character on macOS

Character is the brand's illustration for set moments on macOS (welcome, working, done, nothing found), drawn as an image and never as decoration.

```yaml
component: Character
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
| Native control | None. The registry names no character or illustration control. It is an image beside the words that carry the meaning [APL-19]. |
| Target and spacing | None. The character is never a target. |
| Type | None. The words beside it use SF Pro text styles [APL-3]. |
| Colour and theme | Full-colour artwork must look right in both appearances, with separate light and dark assets when one cannot serve both [APL-5]. The accent never touches it. Whether artwork needs an increased-contrast version: not confirmed. |
| States | No control states. Poses stand in for them, one per moment the system names, and never on a form error. |
| Motion | The working and calm loop stops under Reduce Motion, which asks apps to reduce automatic and repeating animation [APL-1]. Read `accessibilityReduceMotion` [APL-24]. Motion never carries information alone [APL-6]. |
| Accessibility API | VoiceOver. Decorative, so hidden with `accessibilityHidden(_:)` [APL-19]. The words beside it carry the meaning. |
| Navigation placement | One per window, in empty, loading, done, error, welcome and help moments, never in tables, forms or dense views. Apple asks that branding defer to content [APL-8]. |
| Keyboard, pointer, trackpad | None. It takes no focus [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Poses, sizes, the flat rendition and the loop. Apple asks that branding defer to content and never distract from it [APL-8]. |
| Platform owns | Reduce Motion [APL-24]. The appearance switch that picks the matching asset when both exist [APL-5]. |
| Not confirmed | Guidance for animated illustration on macOS: the registry covers animated symbols only [APL-6]. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

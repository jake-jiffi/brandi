# Character on iOS and iPadOS

The brand character or illustration on iOS is an image or animation that marks a state (welcome, working, done, nothing found) and hides from VoiceOver.

```yaml
component: Character
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is an image, or an animated image when it moves [APL-24]. It defers to content, as Apple asks of branding [APL-8]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | None of its own. The words beside it carry the meaning and follow Dynamic Type [APL-3]. |
| Colour and theme | Make sure it looks right in both appearances, or supply light and dark renditions [APL-5]. Soften white backgrounds in Dark Mode so they do not glow [APL-5]. |
| States | One pose per state the system names: welcome, working, done, all caught up, needs a person, nothing found, help. A pose is a state marker, never decoration [APL-8]. |
| Motion | A gentle loop for working and calm. Under Reduce Motion the loop stops, which Apple's call to reduce repetitive animation asks for [APL-1] [APL-24]. Respect `accessibilityPlayAnimatedImages` too [APL-24]. |
| Accessibility API | VoiceOver. Decorative, so hidden with `accessibilityHidden(_:)` [APL-19]. The words beside it say the state. |
| Navigation placement | Empty, loading, done, error, welcome and help moments only, one per screen. Apple keeps branding off the launch screen and allows it on onboarding and welcome screens [APL-8]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for a brand character. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The poses, renditions and loop. Never recoloured, flipped, rotated, cropped or squashed, never two renditions on one screen, and never on a form error. Apple's ask that branding defer to content agrees [APL-8]. |
| Platform owns | Reduce Motion and the animated-images setting, which people set [APL-24]. |
| Not confirmed | Point sizes for each pose and placement: no registry page sets them. The Images page is not in the registry. |

# LoadingState on macOS

LoadingState shows an area waiting on another system on macOS: what is happening, an indeterminate bar, and the character working.

```yaml
component: LoadingState
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
| Native control | None in the registry, and the registry has no page on progress indicators either. The closest pattern is a line of text with an indeterminate indicator in the waiting area. |
| Target and spacing | None. Not a target, unless it offers a way to leave, which then meets the 28 × 28 pt default [APL-1]. |
| Type | The title names the system and the work, Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Waiting. Past ten seconds it says how long the work usually takes and lets people leave. How macOS draws a waiting state: not confirmed. |
| Motion | The bar slows right down under reduced motion, and the character's loop stops. Apple asks apps to reduce automatic and repeating animation [APL-1], so slowing the bar rests on the product's rule (2.3). Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Report the line when the wait starts with `AccessibilityNotification` [APL-19]. Hide the bar and the character [APL-19]. |
| Navigation placement | In the area that is waiting. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | None, unless it offers a way out, which Full Keyboard Access reaches [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Title wording, the character and the slowed bar. Slowing rather than stopping departs from Apple's Reduce Motion guidance [APL-1] (2.3). |
| Platform owns | The Reduce Motion setting [APL-24]. |
| Not confirmed | The native progress indicator. Announcement priority. Placement guidance for a waiting area. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

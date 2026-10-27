# Toast on macOS

Toast is a brief confirmation after an action on macOS, where the registry has no native control and Apple asks apps to keep timed views to a minimum.

```yaml
component: Toast
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
| Native control | None in the registry. The closest pattern is a short message in the window that people dismiss. Apple asks apps to minimise views that dismiss on a timer, and to prefer an explicit action [APL-1]. |
| Target and spacing | Undo and close meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | One sentence, past tense, with a full stop, Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | On `surface-inverse`, with light, dark and increased-contrast variants [APL-4]. Text up to 17 pt keeps 4.5:1 against it [APL-1]. |
| States | Shown, paused while hovered or focused, and gone. Apple prefers views that people dismiss themselves [APL-1]. |
| Motion | It fades in rather than sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Report it once with `AccessibilityNotification` [APL-19]. Apple notes that timed views are hard for people who need longer, including assistive technology users [APL-1]. |
| Navigation placement | Bottom centre of the window, the product's placement. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches Undo [APL-16]. Command-Z undoes the previous operation [APL-16], so undoing never depends on catching the toast. |
| Haptics | None [APL-18]. |
| Brand may change | Timing (5 seconds, or 8 with Undo, paused while hovered or focused), tone and wording. Apple asks apps to minimise timed views and prefer an explicit dismissal [APL-1]. The product's guidelines apply (2.3), and the pause keeps the text readable. |
| Platform owns | Command-Z undo [APL-16]. |
| Not confirmed | A native toast or in-window notice. Placement. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# LoadingState on iOS and iPadOS

An area waiting on another system on iOS says what is happening, shows an indeterminate bar, and can show the brand character working.

```yaml
component: LoadingState
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
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | Not confirmed: the registry holds no Loading or Progress indicators page. When a problem appears at start-up, Apple prefers cached or placeholder data with a quiet label over an alert [APL-13]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | The title names the system and the work, in a text style [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Nothing under a second. Over ten seconds, it says how long the work usually takes and lets people leave. Each change of line is announced [APL-19]. |
| Motion | The product slows the indeterminate bar under reduced motion, and the character's loop stops [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Post an `AccessibilityNotification` when the line changes, so it is read out [APL-19]. The bar and the character are hidden [APL-19]. |
| Navigation placement | In place of the area that is waiting, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | Any way out it offers is a button that Full Keyboard Access reaches [APL-16]. |
| Haptics | None specified for loading states. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The title copy, which names the system ("Loading" is a fallback, not copy), and the character. Apple keeps branding off the launch screen [APL-8], and this is not a launch screen. |
| Platform owns | Reduce Motion, which people set [APL-24]. |
| Not confirmed | The progress indicator API, and Apple's loading guidance: the Loading and Progress indicators pages are not in the registry. |

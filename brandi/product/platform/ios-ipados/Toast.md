# Toast on iOS and iPadOS

A brief confirmation on iOS is a custom toast near the bottom of the screen, with Undo when the action can be reversed, since the registry names no system toast.

```yaml
component: Toast
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. Apple asks apps to keep time-boxed interface elements to a minimum and to prefer dismissal by an explicit action [APL-1]. |
| Target and spacing | Undo and close keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. One sentence, past tense, with a full stop. At large sizes it wraps [APL-3]. |
| Colour and theme | The product's inverse surface, with a tone icon, so the tone never rests on colour [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Shown, paused and gone. Apple prefers explicit dismissal to a timer [APL-1]. The product's timing is under Brand may change. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Post an `AccessibilityNotification` so the sentence is read once [APL-19]. Undo takes `isButton` or `.button` [APL-23] [APL-29]. |
| Navigation placement | Near the bottom of the screen, above the bottom bars, which stay visible [APL-9]. On iPhone Duo, custom components move clear of reserved regions with `ReservedRegion` or `UIView.ReservedRegion` [APL-20]. |
| Keyboard, pointer, trackpad | Apple's standard shortcut for Undo is Command-Z [APL-16]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | A notification haptic reports a task's outcome [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | The surface, the tones and the timing. The product removes a toast after 5 seconds, or 8 with Undo, pausing while it is hovered or focused. Apple asks apps to minimise time-boxed elements and prefer explicit dismissal [APL-1]. The product's guidelines apply (2.3). Errors that need action are Alerts, never toasts. |
| Platform owns | Reserved regions on iPhone Duo [APL-20]. How VoiceOver delivers the announcement [APL-19]. |
| Not confirmed | Whether a toast pauses while VoiceOver is on it, and how long VoiceOver needs: no registry page covers timing for custom overlays. |

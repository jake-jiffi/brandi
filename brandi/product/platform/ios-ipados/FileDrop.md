# FileDrop on iOS and iPadOS

A drop zone on iOS is a real button that opens a file chooser, with drag and drop on iPad as a second way in.

```yaml
component: FileDrop
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
| Native control | None named in the registry. The core is a button [APL-2] that opens a file chooser, so nobody depends on dragging: Apple asks for an on-screen alternative to every gesture [APL-1]. The file chooser and drag and drop: not confirmed. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The rule in words, such as "CSV or XLSX, up to 20 MB", uses a text style too [APL-3]. |
| Colour and theme | The drag-over state shows more than a colour change [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Rest, drag over and error. An error is announced [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The "Choose files" button takes `isButton` or `.button` [APL-23] [APL-29]. When an error appears, post an `AccessibilityNotification` [APL-19]. |
| Navigation placement | In the form or page that needs the files, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | Full Keyboard Access can perform drag and drop on iPadOS [APL-16]. A modifier held during a drag acts the same with touch or pointer [APL-17]. |
| Haptics | None specified for a drop zone. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The title, the rule in words and the button label. A wrong file is rejected with the reason and the fix, never silently, in the brand's voice [APL-8]. |
| Platform owns | Full Keyboard Access drag and drop [APL-16]. The file chooser and the drag session: not confirmed in the registry. |
| Not confirmed | The file chooser and drag and drop API, and accepted types on iOS: the Drag and drop and File management pages are not in the registry. |

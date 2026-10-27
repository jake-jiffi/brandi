# FileList on iOS and iPadOS

The files after a drop on iOS are list rows, each with its name, size, progress and a way to remove it.

```yaml
component: FileList
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-28
    url: https://developer.apple.com/documentation/swiftui/view/accessibilityaction(named:_:
    marker: iOS 16.0+, macOS 13.0+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A list, which supports adding and deleting items [APL-14]. |
| Target and spacing | The remove button keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. A middle ellipsis keeps both ends of a long file name [APL-14]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | A failed file shows an icon and words, never colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Uploading with progress, done, and failed with the reason and what to do. Each change is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group each row [APL-19]. Progress takes `updatesFrequently` or `.updatesFrequently` [APL-23] [APL-29]. Remove is a button, and also a named accessibility action when it is a swipe [APL-28]. |
| Navigation placement | Under the FileDrop it belongs to, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for file lists. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The row layout, the progress style and the messages. A failed file says why and what to do, in the brand's voice [APL-8]. |
| Platform owns | Deleting in edit mode [APL-14]. |
| Not confirmed | Upload progress conventions on iOS: the Progress indicators page is not in the registry. |

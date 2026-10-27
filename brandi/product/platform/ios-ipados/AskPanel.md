# AskPanel on iOS and iPadOS

The assistant's panel on iOS holds the thread and a composer: a sheet or its own screen on iPhone, a column or a sheet on iPad.

```yaml
component: AskPanel
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest patterns are a nonmodal sheet, which lets people keep working in the view behind it [APL-12], and a split view column on iPad [APL-10]. |
| Target and spacing | Send, Stop and the header buttons keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | In Dark Mode a sheet lifts onto the elevated background [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Empty, with a greeting, the composer and up to three suggestions. Then replying, done, stopped or failed. Send becomes Stop while an answer runs. Each answer's status is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Each answer has its own status line, and the thread itself is not announced [APL-19]. Header buttons carry their own names [APL-19]. The composer comes after the thread in reading order [APL-19]. |
| Navigation placement | iPhone: a sheet at the medium or large detent [APL-12]. iPad: a column beside the content [APL-10] or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | iPadOS includes text views in its focus system [APL-16] [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for the ask panel. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The greeting, the suggestions, and tabs if kept, as a tab list whose buttons have their own names. A viewer sees no suggestion that creates anything. In the brand's voice [APL-8]. |
| Platform owns | Detents, the grabber and swipe to dismiss [APL-12]. |
| Not confirmed | Keeping the composer above the keyboard, and sending on Return: no registry page covers them. Apple's Generative AI page is not in the registry. |

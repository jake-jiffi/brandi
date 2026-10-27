# CommandMenu on iOS and iPadOS

The palette that jumps to any record or action on iOS opens from a search control, or from Command-K on a hardware keyboard.

```yaml
component: CommandMenu
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
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | None. The closest patterns are a search field, which toolbars hold [APL-11], and the iOS tab bar's search tab [APL-9]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Prefer system backgrounds, so a palette in front lifts onto the elevated colours in Dark Mode [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Typing filters every group. With no match, it offers to ask the assistant only when `onAsk` is passed. A change in the results is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The field takes `isSearchField` or `.searchField` [APL-23] [APL-29]. Result changes post an `AccessibilityNotification` [APL-19]. As a modal it takes `isModal`, and group headings take `isHeader` [APL-23]. |
| Navigation placement | Over the screen, opened from anywhere, and one at a time, as Apple asks of sheets [APL-12]. Groups run Jump to, Actions, then Ask. |
| Keyboard, pointer, trackpad | Command-K on a hardware keyboard. Command is the right main modifier, and Command-K is not among the standard shortcuts Apple lists [APL-16]. Esc, Apple's standard cancel key, closes it [APL-16]. |
| Haptics | None specified for the command menu. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The placeholder, "Search or ask" by default, the group order and the empty line, which promises nothing unless `onAsk` is set, all in the brand's voice [APL-8]. Records are found by name. |
| Platform owns | System shortcuts, which the palette's shortcut never overrides [APL-16]. |
| Not confirmed | A system search interface to build on: the Search fields and Searching pages are not in the registry. |

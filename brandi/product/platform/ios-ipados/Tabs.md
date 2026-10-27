# Tabs on iOS and iPadOS

Sections of one page or record on iOS take the closest pattern, a segmented control, because Apple's tab bar is for the app's top level.

```yaml
component: Tabs
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
| Native control | None for sections within a page. Apple's tab bar moves between top-level sections of the app [APL-9]. The closest pattern is a segmented control [APL-2]. Whether Apple endorses one for record sections: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | Tab titles need not grow as people enlarge text [APL-3]. Short labels. |
| Colour and theme | The selected tab never relies on colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Selected or not. An `attention` count takes the highlight and is read as words [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The selected tab carries `isSelected` or `.selected` [APL-23] [APL-29]. `countLabel` is what VoiceOver hears for the count, such as "12 overdue" [APL-19]. |
| Navigation placement | Under the title, near the content it switches [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches the control, and Apple asks for no custom keyboard navigation on segmented controls [APL-16]. |
| Haptics | None specified for in-page tabs. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Two to seven tabs, each keeping its own scroll and filters, with counts. The product's own SegmentedControl holds two to five options, so seven tabs may need another pattern. The product's arrow-key path departs from Apple's ask to leave segmented controls to Full Keyboard Access [APL-16]. The product's guidelines apply (2.3). |
| Platform owns | The tab bar, which is not this component [APL-9]. |
| Not confirmed | Apple's pattern for sections within one record: the Segmented controls and Tab views pages are not in the registry. |

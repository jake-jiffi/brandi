# List on iOS and iPadOS

A column of rows on iOS is the system list, for records on phones, inboxes, queues and the list side of list and detail.

```yaml
component: List
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
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | SwiftUI `List` or UIKit `UITableView` [APL-14]. The style follows the data: the grouped style adds headers, footers and space between groups [APL-14]. Rows lay out with `UIListContentConfiguration` [APL-14]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Lists suit text. Items that vary widely in size, or many images, suit a collection instead [APL-14]. |
| Colour and theme | System background colours, plain or grouped [APL-4]. Dividers take `separator` [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | A navigation list keeps the selected row highlighted [APL-14]. Loading, empty and error come from the product. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads rows in order [APL-19]. Section headers take `isHeader` or `.header` [APL-23] [APL-29]. |
| Navigation placement | On iPad, the content list of a split view, between sidebar and detail [APL-10]. On iPhone Duo, the closed device shows the list or the detail, and the open device shows both side by side [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A focused list row draws white text on an accent-colour highlight [APL-15]. |
| Haptics | None specified for lists. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | `boxed`, the default, and `divided`. No alphabet index beside rows that carry trailing controls, since both use the trailing edge [APL-14]. |
| Platform owns | Edit mode for selecting, deleting and reordering [APL-14]. The list styles [APL-14]. |
| Not confirmed | Which list style matches `boxed`: no registry page names an inset style. |

# Board on iOS and iPadOS

Records in columns by stage on iOS are a scrolling collection of columns, and every card has a Move to menu so nothing depends on dragging.

```yaml
component: Board
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None named in the registry. The closest pattern is a collection, which suits items that vary in size [APL-14]. Moving a card never depends on dragging: Apple asks for an on-screen alternative to every gesture [APL-1]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. The Move to button keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Column counts and badges carry words, never colour alone [APL-1]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Each card follows the ListRow rules. Moving a card reports the change to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Each card groups its title, meta line and badge [APL-19]. Move to is also a named accessibility action [APL-28]. Column headings take `isHeader` or `.header` [APL-23] [APL-29]. |
| Navigation placement | In the content. On iPhone Duo, a grid prefers an even number of columns, so it splits cleanly at the fold [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS a column can be a focus group: Tab moves between columns and the arrow keys within one [APL-15]. Full Keyboard Access can drag and drop [APL-16]. A card takes the hover effect for large elements [APL-17]. |
| Haptics | An impact haptic can mark a card snapping into place [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | Column order, card layout and counts. A Move to menu on every card does what dragging does. A restyle keeps familiar behaviour [APL-8]. |
| Platform owns | Drag and drop through Full Keyboard Access [APL-16]. The fold on iPhone Duo [APL-20]. |
| Not confirmed | The collection and drag and drop API: the Collections and Drag and drop pages are not in the registry. How a board collapses at compact widths. |

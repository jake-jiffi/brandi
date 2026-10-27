# ListRow on iOS and iPadOS

One record on iOS is a list row: a leading image, a title, a meta line, and a trailing badge, value or disclosure indicator.

```yaml
component: ListRow
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
| Native control | A list row, laid out with `UIListContentConfiguration` [APL-14]. A small leading image followed by a brief label is one of Apple's row layouts [APL-14]. Drilling in takes a disclosure indicator, `UITableViewCell.AccessoryType.disclosureIndicator` [APL-14]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep row text short [APL-14]. Tight leading suits a row, but never on three or more lines [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Apple suggests the accent colour for status such as unread badges [APL-8]. The unread dot comes with "(unread)" for VoiceOver, so colour is not the only cue [APL-1]. |
| States | Selected: a navigation list keeps the open row highlighted [APL-14]. Unread adds the dot. A focused row on iPadOS draws white text on the accent colour [APL-15]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group the row so its parts read together [APL-19]. `isSelected` or `.selected` marks the open row [APL-23] [APL-29]. `unread` adds "(unread)" to the label [APL-19]. Swipe actions are also named accessibility actions [APL-28], with an on-screen alternative [APL-1]. |
| Navigation placement | In a List. An info button only reveals more about the row and never navigates [APL-14]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. Pointer hover on a row takes tint, not scale or shadow, because a row cannot grow without overlapping its neighbours [APL-17]. |
| Haptics | None specified for list rows. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The lead tile, the bold title, the meta line, and the trailing badge, value or chevron. The meta line answers "what is it, and what is next". A badge is never squeezed to its dot. A restyle keeps the familiar row layout [APL-8]. |
| Platform owns | The disclosure indicator [APL-14]. The iPadOS focus highlight [APL-15]. |
| Not confirmed | Row height in points. |

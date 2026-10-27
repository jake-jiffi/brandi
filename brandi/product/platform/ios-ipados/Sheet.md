# Sheet on iOS and iPadOS

A record or a longer edit on iOS opens in a sheet, which rests at detent heights on iPhone and centres on iPad, unless a wide screen keeps the detail beside the list.

```yaml
component: Sheet
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
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
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
```

| Field | Spec |
|---|---|
| Native control | A sheet: SwiftUI `sheet(item:onDismiss:content:)`, UIKit `UISheetPresentationController` [APL-12]. On iOS and iPadOS it can be modal or nonmodal [APL-12]. iPadOS prefers the page or form sheet styles, centred over a dimmed background [APL-12]. |
| Target and spacing | Its toolbar buttons keep hit regions of at least 44 × 44 pt [APL-2]. A resizable sheet shows a grabber [APL-12]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | In Dark Mode a sheet lifts onto the elevated background by itself, and system backgrounds keep that working [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Detents: large, the full height, and medium, about half [APL-12]. A sheet supports large by default, and adding medium lets it rest at both [APL-12]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The grabber works with VoiceOver, so people can resize the sheet without seeing it [APL-12]. A modal sheet takes `isModal` [APL-23]. |
| Navigation placement | Cancel on the leading edge of its top toolbar, Done on the trailing edge [APL-12]. Done always pairs with Cancel or Back, and never all three [APL-12]. One sheet at a time from the main interface [APL-12]. On iPad, the detail can sit beside the list in a split view [APL-10]. |
| Keyboard, pointer, trackpad | Return activates the primary and can close the sheet [APL-2]. Esc is Apple's standard key for cancelling the current action [APL-16]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for sheets. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The product's sheet comes in from the right, inset like the rail. On iOS a sheet rests at detent heights with a grabber at its top edge, and iPadOS centres it [APL-12]. Where the product keeps its side panel, its guidelines apply (2.3). A sheet may open a confirmation alert. Width comes from the product's tokens. |
| Platform owns | Detents, the grabber and swipe to dismiss [APL-12]. The elevated background in Dark Mode [APL-5]. Moving clear of the fold on iPhone Duo [APL-20]. |
| Not confirmed | A side-anchored sheet on iOS: no registry page describes one. |

# Tooltip on iOS and iPadOS

On iOS, the words a tooltip would show live in the item's title and its VoiceOver label.

```yaml
component: Tooltip
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None for iOS. Apple describes hover tooltips for macOS and visionOS [APL-2]. The closest patterns are a toolbar item's title, which the system shows in overflow menus and expanded forms [APL-20], and the control's VoiceOver label [APL-19]. |
| Target and spacing | Its trigger keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | None: Apple describes hover tooltips only for macOS and visionOS [APL-2]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The tooltip's words become the control's label, so nothing depends on hovering [APL-19]. |
| Navigation placement | None on iOS. Essential information is on screen, never in one channel only [APL-1]. |
| Keyboard, pointer, trackpad | On iPadOS, Apple asks apps not to show instructional text with the pointer [APL-17]. A custom annotation can show useful values instead, such as X and Y over a graph [APL-17]. |
| Haptics | None specified for tooltips. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The product's hover and keyboard tooltip does not carry over to iOS [APL-2]. A definition people need on touch is a Toggletip. One short sentence at most, and never interactive. |
| Platform owns | Overflow menu titles [APL-20] and how VoiceOver reads labels [APL-19]. |
| Not confirmed | A help tag API for iPadOS with a pointer: the Offering help page is not in the registry. |

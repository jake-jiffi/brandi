# ButtonGroup on iOS and iPadOS

Related buttons on iOS are a row or stack of system buttons, with the preferred action trailing and Cancel leading.

```yaml
component: ButtonGroup
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a single control. The closest patterns are a toolbar item group, `ToolbarItemGroup` in SwiftUI or `UIBarButtonItemGroup` in UIKit [APL-20], and the button row of an alert or sheet [APL-12] [APL-13]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. In a toolbar, separate text-labelled buttons with fixed space so their words do not run together [APL-11]. On iPhone Duo, groups space themselves, so add no fixed spacing there [APL-20]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes a row may not fit. Reduce columns and stack instead of truncating [APL-3]. |
| Colour and theme | Same size for every button, with a more prominent style on the preferred one [APL-2]. One or two prominent buttons per view [APL-2]. |
| States | Each button keeps its own states, including a press state on custom buttons [APL-2]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads each button in reading order [APL-19]. Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. |
| Navigation placement | In a row, the button people are most likely to choose sits trailing and Cancel leading. In a stack, the default sits at the top and Cancel at the bottom [APL-13]. |
| Keyboard, pointer, trackpad | Return activates the primary button [APL-2]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. Custom bar buttons need touching hit regions [APL-17]. |
| Haptics | None specified for a button group. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The gap between buttons and the wrap point come from the product's tokens. Secondary first, the primary last, Cancel immediately before the primary, which matches Apple's trailing default [APL-13]. Labels are in sentence case. Apple asks for title-style capitalisation on buttons [APL-2] and sentence-style on alert buttons [APL-13]. The product's guidelines apply (2.3). |
| Platform owns | Button order and layout inside alerts, which the system draws [APL-13]. The overflow menu in bars [APL-20]. |
| Not confirmed | The order inside a stacked group outside alerts. Apple gives the stack order, default on top, only for alerts [APL-13]. |

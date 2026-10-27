# IconButton on iOS and iPadOS

An icon-only button on iOS is the system button with a symbol and a descriptive VoiceOver label, for actions people know by their icon.

```yaml
component: IconButton
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | SwiftUI `Button` or UIKit `UIButton`, showing a symbol [APL-2]. Familiar actions take familiar icons, such as `square.and.arrow.up` for sharing [APL-2]. In bars, the standard Back and Close buttons use the standard symbols [APL-11]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 24 pt of padding around an icon without a bezel [APL-1]. Custom bar buttons need hit regions that touch, so the pointer does not snap back between them [APL-17]. |
| Type | The symbol grows with the text size, as SF Symbols do [APL-3]. In a toolbar, give each item a title as well as its symbol: the system shows the title in overflow menus [APL-20]. |
| Colour and theme | Prefer system symbols without borders: they take the right colouring and vibrancy, and the bar draws hover and selection [APL-11]. Light, dark and increased-contrast variants for any custom colour [APL-4]. |
| States | A custom button always draws a press state [APL-2]. UIKit marks an unavailable element `.notEnabled` [APL-29]. Disabled styling: not confirmed. |
| Motion | Avoid motion on interactions people repeat often [APL-6]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. The `label` is its name. An icon has no visible text, so the label must describe the action [APL-19]. Never "Back" or "Close" as visible text on the standard buttons [APL-11]. |
| Navigation placement | Toolbars and dense rows. On iPhone Duo, items overflow from the bottom of the side bar upwards, and the ellipsis symbol is reserved for the overflow menu [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. The pointer takes the highlight effect on a small control with a transparent background, and lift on a small opaque one [APL-17]. |
| Haptics | None specified for icon buttons. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The icon from the product's set, the variant (`ghost` by default) and the size. Apple describes hover tooltips only for macOS and visionOS [APL-2], so the product's hover tooltip does not carry over. The label still names what it acts on ("More actions for [record]"). In toolbars, Apple reserves the ellipsis symbol for the system overflow menu and asks other menus for a distinct symbol [APL-20]. |
| Platform owns | The standard Back and Close symbols and behaviour [APL-11]. The overflow menu that collects items when a bar runs out of room [APL-20]. |
| Not confirmed | Symbol point sizes in bars: the SF Symbols page is not in the registry. Disabled styling. |

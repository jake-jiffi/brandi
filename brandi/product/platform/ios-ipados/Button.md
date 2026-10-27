# Button on iOS and iPadOS

The pressable action on iOS is the system button, with the product's variants mapped to Apple's styles and roles.

```yaml
component: Button
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-21
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent
    marker: iOS 26.0+, macOS 26.0+
    read: 2026-10-27
  - key: APL-22
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/borderedprominent
    marker: iOS 15.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-27
    url: https://developer.apple.com/documentation/swiftui/keyboardshortcut/defaultaction
    marker: iOS 14.0+, macOS 11.0+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | SwiftUI `Button`, with `glassProminent` from iOS 26.0 or `borderedProminent` for the product's `primary` [APL-21] [APL-22]. UIKit `UIButton` [APL-2]. Roles: normal, primary, cancel and destructive. `danger` and `danger-solid` take the destructive role, which draws in system red [APL-2]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Body is 17 pt at the default size and 53 pt at AX5 [APL-3]. Short labels that start with a verb [APL-2]. |
| Colour and theme | A prominent style puts the app accent on the button's background [APL-2] [APL-4]. One or two prominent buttons per view [APL-2]. Keep label colours clear of colourful content behind them [APL-2]. Every custom colour needs light, dark and increased-contrast variants [APL-4]. |
| States | A custom button always draws a press state [APL-2]. A slow action shows an activity indicator inside the button, and can swap the label, such as "Checkout" to "Checking out…" [APL-2]. UIKit marks a disabled button `.notEnabled` [APL-29]. Disabled styling: not confirmed. |
| Motion | Liquid Glass reacts more strongly to touch than to a trackpad [APL-6]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. The label is the visible title. System buttons have generic labels, so give each a descriptive one [APL-19]. |
| Navigation placement | In a toolbar, one `.prominent` action, on the trailing side [APL-11]. In a sheet, Done trailing and Cancel leading [APL-12]. On iPhone Duo's side bars, navigation controls come first at the top, then prominent actions such as Done [APL-20]. |
| Keyboard, pointer, trackpad | Return activates the primary button, and can close the sheet or alert it sits in [APL-2]. `KeyboardShortcut.defaultAction` binds Return [APL-27]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. Bar buttons get the highlight effect, and a custom filled button takes lift [APL-17]. |
| Haptics | Apple's list of controls that play system haptics names toggles, sliders and pickers, not buttons [APL-18]. A notification haptic reports a task's outcome, if the product adds one, and stays optional [APL-18]. |
| Brand may change | The accent colour on the prominent background, the variants and the label wording [APL-8] [APL-2]. A custom font that supports Dynamic Type and Bold Text [APL-3]. Copy is one to three words, verb first, in sentence case. Apple asks for title-style capitalisation on buttons [APL-2] and sentence-style on alert buttons [APL-13]. The product's guidelines apply (2.3). The product draws a destructive dialog's final confirm in `danger-solid`. Apple asks for the destructive style only when people did not choose the destructive action on purpose [APL-13]. The product's guidelines apply. |
| Platform owns | The Liquid Glass material, sizes, placement in bars, and corner radii concentric with the bar [APL-7] [APL-11]. Return activating the primary button [APL-2]. |
| Not confirmed | Disabled styling. Whether standard buttons play a haptic. The styles for `secondary` and `ghost`: the button style pages list `bordered`, `borderless` and `plain` [APL-21] [APL-22], but not their iOS availability or fit. |

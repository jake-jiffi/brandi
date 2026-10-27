# FormActions on iOS and iPadOS

The row that ends a form on iOS holds Cancel and one primary, though in a sheet Apple puts those actions in the top toolbar.

```yaml
component: FormActions
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
| Native control | Buttons [APL-2]. In a sheet, Apple places Cancel on the leading edge of the top toolbar and Done on the trailing edge [APL-12]. In a toolbar, one `.prominent` action sits trailing [APL-11]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Labels say what the button does, in a few words [APL-2]. |
| Colour and theme | The primary takes a prominent style, with the accent colour on its background [APL-2]. A destructive action takes system red [APL-2]. |
| States | Each button keeps its own states. A slow save shows an activity indicator inside the button [APL-2]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. VoiceOver reads Cancel, then the primary, in reading order [APL-19]. |
| Navigation placement | At the foot of the form: Cancel, then the primary on the trailing side, Apple's order for a row of buttons [APL-13]. A destructive action sits apart on the leading side. In a sheet, Apple's placement is the top toolbar [APL-12]. |
| Keyboard, pointer, trackpad | Return activates the primary and can close the sheet it sits in [APL-2]. Esc is Apple's standard key for cancelling the current action [APL-16]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for form actions. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The primary names the result, such as "Save billing", never "Submit", which Apple uses as an example of a key action [APL-11]. Labels are in sentence case. Apple asks for title-style capitalisation on buttons [APL-2] and sentence-style on alert buttons [APL-13]. The product ends the form with this row above a hairline, where Apple puts a sheet's actions in its top toolbar [APL-12]. The product's guidelines apply (2.3). |
| Platform owns | Swipe to dismiss, which people expect on a sheet. With unsaved changes, an action sheet confirms [APL-12]. Return activating the primary [APL-2]. |
| Not confirmed | Whether a sheet shows the form's row and toolbar actions together. Apple asks only that Cancel, Done and Back never all appear at once [APL-12]. |

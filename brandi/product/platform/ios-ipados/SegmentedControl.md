# SegmentedControl on iOS and iPadOS

Two to five views of the same content on iOS use Apple's segmented control, one of its button-like components.

```yaml
component: SegmentedControl
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
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A segmented control, which Apple lists among button-like components with their own appearance and behaviour [APL-2]. Its SwiftUI and UIKit API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Short option labels. At large sizes, reduce columns before truncating [APL-3]. |
| Colour and theme | The selected segment is not shown by colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Selected, unselected and pressed. Disabled segments: not confirmed. |
| Motion | The selection slides to the chosen option. Under Reduce Motion it fades instead [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. `isSelected` in SwiftUI or `.selected` in UIKit marks the chosen item [APL-23] [APL-29]. The group's `label` names it [APL-19]. |
| Navigation placement | Above the content it switches, near the content it affects [APL-20]. It changes the view at once. Moving between sections of the app is the tab bar's job [APL-9]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches segmented controls, and Apple asks apps not to add their own keyboard navigation to them [APL-16]. The pointer gets the highlight effect by default [APL-17]. iPhone has no focus system [APL-15]. |
| Haptics | Not confirmed. Apple's haptics list names toggles, sliders and pickers, not segmented controls [APL-18]. |
| Brand may change | The pill shape, the option labels and icons, and the size. The product's web path moves the selection and focus together with the arrow keys. On iPadOS that departs from Apple's ask to leave segmented controls to Full Keyboard Access [APL-16]. The product's guidelines apply (2.3) to a custom build. |
| Platform owns | The system control's drawing, its handling under Full Keyboard Access [APL-16] and its pointer highlight [APL-17]. |
| Not confirmed | The SwiftUI and UIKit API. Whether the system control plays a selection haptic. Disabled segments. The Segmented controls page is not in the registry. |

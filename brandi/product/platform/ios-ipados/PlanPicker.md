# PlanPicker on iOS and iPadOS

One plan from two to five on iOS shows as cards that say what each includes, with the chosen card marked.

```yaml
component: PlanPicker
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest pattern is an options list whose chosen row takes a checkmark [APL-14], drawn as cards. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | The chosen card shows a check as well as colour [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Chosen and not chosen, with the safest preselected. An options list marks a choice with a brief highlight, then a checkmark [APL-14]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group each card so its name, price and inclusions read together [APL-19]. The chosen card carries `isSelected` or `.selected` [APL-23] [APL-29]. |
| Navigation placement | In the content layer of a sign-up or upgrade screen [APL-7]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A large element takes the hover effect, with custom scale, tint or shadow. Shadow never goes without scale [APL-17]. |
| Haptics | None specified for plan pickers. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The card layout, prices in the `currency` style, and what each plan includes. More than five is a Select. A restyle keeps the selection behaviour familiar [APL-8]. |
| Platform owns | Dynamic Type [APL-3]. |
| Not confirmed | Whether App Store rules on in-app purchase apply to these plans: no registry page covers payments. |

# PlanPicker on macOS

PlanPicker chooses one plan from two to five on macOS, shown as cards, with no native control in the registry.

```yaml
component: PlanPicker
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. Cards in the content layer [APL-7], acting as one choice. The closest control it covers is a list of options with a checkmark on the chosen one [APL-14]. |
| Target and spacing | Each card is a target, well over the 28 × 28 pt default [APL-1]. |
| Type | Plan name in Title 3, 15 pt, price in Title 2 or Title 3, details in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The chosen card has a check as well as colour [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Chosen, not chosen and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. The safest plan is preselected. |
| Motion | A change of choice fades under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The chosen card carries `isSelected` [APL-23]. Group each card's name, price and inclusions [APL-19]. |
| Navigation placement | In a window or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each card [APL-16]. Arrow keys between cards: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Card layout, prices in the currency style, and what each includes. Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | A native card picker. Keyboard movement between cards. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

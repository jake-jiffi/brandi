# Menu on iOS and iPadOS

Actions on one thing on iOS open in a menu from a button, or from the toolbar's More menu.

```yaml
component: Menu
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | A menu opened from a button. Toolbars hold menus as items, and a More menu holds actions that do not fit [APL-11]. When a bar runs out of room, the system overflow menu takes the rest [APL-20]. The Menus and Pull-down buttons pages and the API: not confirmed. |
| Target and spacing | The trigger keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Destructive items go in danger text, last after a separator, with words that say what they destroy, never colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Checked items show a check, not colour alone [APL-1]. Disabled items stay visible and do nothing. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The trigger is named "More actions for [record]" [APL-19]. Items take `isButton` or `.button` [APL-23] [APL-29]. UIKit marks an unavailable element `.notEnabled` [APL-29]. |
| Navigation placement | From an overflow button on a row or card, or the toolbar's More menu [APL-11]. In toolbars the ellipsis symbol is reserved for the system overflow menu [APL-20]. On iPhone Duo, context menus move clear of the fold [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. The product's single-key shortcuts inside an open menu: not confirmed on iOS. |
| Haptics | None specified for menus. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Item labels, icons, descriptions and shortcuts. Six items or fewer is best. Destructive items go last and open a confirmation. Apple asks for no alert on common actions that can be undone [APL-13], so a confirmation is for what cannot be undone. |
| Platform owns | Where the menu opens, and the overflow menu [APL-20]. Full Keyboard Access [APL-16]. |
| Not confirmed | The menu API, item roles and the pull-down button: the Menus, Pull-down buttons and Context menus pages are not in the registry. Single-key shortcuts in an open menu. |

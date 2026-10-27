# Kbd on iOS and iPadOS

A key hint on iOS and iPadOS writes a keyboard shortcut with Apple's modifier symbols, in Apple's order.

```yaml
component: Kbd
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
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
| Native control | None. Apple's Keyboards page writes shortcuts with its modifier symbols, and SwiftUI declares a shortcut with `KeyboardShortcut` [APL-16]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | A text style, so it grows with the text around it [APL-3]. San Francisco includes SF Mono for fixed-width text [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | None. It is static text [APL-23]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Static text, `isStaticText` or `.staticText` [APL-23] [APL-29]. Its label spells the keys in words, such as "Command K" [APL-19]. |
| Navigation placement | Beside the command it triggers, in menus, the command menu and hints. Shortcuts are for the most frequent commands only [APL-16]. |
| Keyboard, pointer, trackpad | Modifiers in Apple's order: Control, Option, Shift, Command [APL-16]. Command is the main modifier, and Control is best avoided [APL-16]. A two-character key's upper character is written without Shift [APL-16]. The system localises and mirrors shortcuts [APL-16]. |
| Haptics | None specified for key hints. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The key cap style and the `rail` variant. The product writes the Mac form, such as "⌘K", which matches Apple's symbols [APL-16], and hides key hints on touch screens. |
| Platform owns | Localising and mirroring each shortcut [APL-16]. System shortcuts, which Apple asks apps not to override [APL-1] [APL-16]. |
| Not confirmed | Whether iPadOS lists the app's shortcuts in its own menu bar or overlay: the menu bar page is not in the registry. When a key hint should show on an iPad with a hardware keyboard. |

# WorkspaceSwitcher on macOS

WorkspaceSwitcher chooses the account, workspace or client someone works in on macOS, from a menu on the account button.

```yaml
component: WorkspaceSwitcher
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A pull-down button, which Apple lists as its own component [APL-2], opening a menu. Its page is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Workspace names in `menuFont(ofSize:)` [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The item in hand in `selectedMenuItemTextColor` [APL-4]. The current workspace has a check, never colour alone [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Closed, open and switching. The current workspace is checked in the menu [APL-1]. |
| Motion | System menu motion [APL-6]. |
| Accessibility API | VoiceOver. The account button is named "[name], [role], account menu" [APL-19]. After a switch, report where the person is now with `AccessibilityNotification` [APL-19]. |
| Navigation placement | From the account button in the sidebar's footer, the product's placement. Apple asks apps to keep critical actions off a sidebar's bottom [APL-10]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the button [APL-16]. Esc cancels and closes the menu [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Placement, names and the current marker. The footer placement departs from Apple's advice on a sidebar's bottom [APL-10]. The product's guidelines apply (2.3). |
| Platform owns | Menu fonts and colours [APL-3] [APL-4]. |
| Not confirmed | The pull-down button API. Keyboard movement inside the menu. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

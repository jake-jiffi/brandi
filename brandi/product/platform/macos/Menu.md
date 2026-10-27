# Menu on macOS

Menu is a menu on macOS: a contextual menu on secondary click, or a pull-down from a button, with every toolbar command also in the menu bar.

```yaml
component: Menu
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A menu. Secondary click reveals a contextual menu [APL-17]. From a button, a pull-down button, which Apple lists as its own component [APL-2]. In a toolbar, menus sit with buttons as bar items, and a More menu holds extra actions [APL-11]. Apple's menu page is not in the registry. |
| Target and spacing | The trigger meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Menu item height: not confirmed. |
| Type | Items in `menuFont(ofSize:)` [APL-3]. Shortcuts use Apple's modifier symbols, in the order Control, Option, Shift, Command [APL-16]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The item in hand takes `selectedMenuItemTextColor` [APL-4]. Destructive items in the product's danger text, which never carries meaning alone [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Item in hand, checked, unavailable and destructive. Unavailable items stay visible and do nothing, their text in `disabledControlTextColor` [APL-4]. |
| Motion | System menus bring their own motion [APL-6]. Reduce Motion applies to any custom menu [APL-1]. |
| Accessibility API | VoiceOver. The trigger's label names what it acts on, such as "More actions for [record]" [APL-19]. |
| Navigation placement | Contextual menus open at the pointer [APL-17]. Toolbar menus open from their item, and the More menu sits at the toolbar's trailing edge [APL-11]. Every toolbar command is also in the menu bar [APL-11]. |
| Keyboard, pointer, trackpad | Control-F2 moves focus to the menu bar [APL-16]. Esc cancels and closes it [APL-16]. With Control held over content that has a menu, the pointer shows `contextualMenu` [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | Items, icons, grouping and the danger style. In a toolbar, Apple allows a More menu for extra actions but asks apps never to build the overflow menu themselves [APL-11]. |
| Platform owns | Menu fonts and colours [APL-3] [APL-4]. Contextual menus on secondary click [APL-17]. The toolbar overflow menu [APL-11]. |
| Not confirmed | Menu item height, keyboard movement inside an open menu and single-key item shortcuts: Apple's menu page is not in the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

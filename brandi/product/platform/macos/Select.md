# Select on macOS

Select is a pop-up button on macOS: a closed control showing the current choice, which opens a menu of the options.

```yaml
component: Select
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | A pop-up button, which Apple's Buttons page lists as its own component [APL-2]. Its page is not in the registry, so the native API and its menu behaviour are not confirmed here. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Closed in `controlContentFont(ofSize:)`, open in `menuFont(ofSize:)`, which matches system menus [APL-3]. The placeholder says what to choose. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The option in hand takes `selectedMenuItemTextColor` [APL-4]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Closed, open, option in hand, chosen, invalid and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. Invalid styling: not confirmed. |
| Motion | System menus bring their own motion [APL-6]. Reduce Motion applies to any custom list [APL-1]. |
| Accessibility API | VoiceOver reads the field's name and its current value [APL-19]. A Select outside a Field still needs a label [APL-19]. The pop-up role and value API: not confirmed. |
| Navigation placement | In a form or a sheet, beside or under its label [APL-12]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches it [APL-16]. Esc cancels [APL-16]. Arrow keys, type-to-select and the choosing key on the native control: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Options, placeholder wording and the open list's look. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. A custom list in place of the system menu gives up `menuFont` and the menu colours [APL-3] [APL-4]. |
| Platform owns | Menu fonts and colours [APL-3] [APL-4]. Full Keyboard Access [APL-16]. |
| Not confirmed | The pop-up button API, its keyboard behaviour and option limits: Apple's pop-up button and menu pages are not in the registry. Invalid styling. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

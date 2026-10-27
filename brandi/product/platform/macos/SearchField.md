# SearchField on macOS

SearchField is a search field on macOS, often in the trailing section of the toolbar.

```yaml
component: SearchField
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A search field, which Apple names as a toolbar navigation control [APL-11]. Its own page is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | SF Pro, Body 13 pt [APL-3]. The placeholder says what is searched, in `placeholderTextColor` [APL-4]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Text in `textColor` on `textBackgroundColor` [APL-4]. In a toolbar, its corner radius is concentric with the bar [APL-11]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Empty, typing, focused and unavailable. A search field takes a focus ring [APL-15]. Unavailable: text in `disabledControlTextColor` [APL-4]. The clear button and scopes: not confirmed. |
| Motion | None of its own [APL-6]. |
| Accessibility API | VoiceOver. Name it by what it searches [APL-19]. The search field trait is not in the registry. |
| Navigation placement | The toolbar's trailing section, which can hold an optional search field [APL-11]. Or above the list it filters. |
| Keyboard, pointer, trackpad | Option-Command-F jumps to the search field [APL-16]. Command-F opens a find window, which is a different job [APL-16]. The product's single-key shortcut, such as "/", stays off while someone types elsewhere or Root turns shortcuts off. |
| Haptics | None [APL-18]. |
| Brand may change | Placeholder wording, size and the single-key shortcut. The single key departs from Apple's advice to lead custom shortcuts with Command [APL-16]. The product's guidelines apply (2.3). |
| Platform owns | Option-Command-F [APL-16]. The focus ring [APL-15]. Toolbar placement and overflow [APL-11]. |
| Not confirmed | The search field API, its clear button and scopes: Apple's search field page is not in the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

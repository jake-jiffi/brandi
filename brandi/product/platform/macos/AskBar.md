# AskBar on macOS

AskBar is one field for searching and asking on macOS: a search field that also sends a question to the assistant.

```yaml
component: AskBar
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
  - key: APL-33
    url: https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push
    marker: macOS
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A search field [APL-11] with an Ask push button [APL-33]. The registry has no page on a combined search and ask field. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Input in Body 13 pt [APL-3]. The placeholder says what can be found, in `placeholderTextColor` [APL-4]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Text in `textColor` on `textBackgroundColor` [APL-4]. Colour goes on the Ask button only, never on several controls at once [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Empty, typing, focused and unavailable. Focus is a ring [APL-15]. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | None of its own [APL-6]. |
| Accessibility API | VoiceOver. Name the field by what it finds, and give the Ask button its own label [APL-19]. |
| Navigation placement | One per product, on Home. Elsewhere the same thing opens from the sidebar's search or the palette. Toolbars can hold a search field at the trailing edge [APL-11]. |
| Keyboard, pointer, trackpad | Command-K focuses it, a shortcut Apple does not reserve [APL-16]. Return in the field asks. |
| Haptics | None [APL-18]. |
| Brand may change | Placeholder wording and the Ask label. Apple asks custom shortcuts to lead with Command [APL-16], which Command-K does. |
| Platform owns | The focus ring [APL-15]. Standard text editing shortcuts [APL-16]. |
| Not confirmed | A combined search and ask control. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

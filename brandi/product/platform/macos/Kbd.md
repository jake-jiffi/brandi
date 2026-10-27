# Kbd on macOS

Kbd shows a keyboard shortcut on macOS, written with Apple's modifier symbols in Apple's order.

```yaml
component: Kbd
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
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
| Native control | None as a control. Shortcuts use the symbols Apple defines for Command, Shift, Option and Control [APL-16]. |
| Target and spacing | None. Kbd is not a target. |
| Type | SF Pro [APL-3]. List modifiers in Apple's order: Control, Option, Shift, Command [APL-16]. Write the upper character of a two-character key without Shift, such as Command-Question mark [APL-16]. |
| Colour and theme | Dynamic colours, so the keys read in both appearances [APL-4]. Custom colours need increased-contrast variants too [APL-4]. |
| States | No states. |
| Motion | None. |
| Accessibility API | VoiceOver. Give it a label that says the keys in words [APL-19]. |
| Navigation placement | Beside the command it triggers: in menus, the command menu and hints. Menu placement on macOS: not confirmed. |
| Keyboard, pointer, trackpad | Custom shortcuts lead with Command [APL-16]. Never reuse a standard shortcut, such as Command-W, for another action [APL-16]. The system localises shortcuts for the connected keyboard and mirrors them in a right-to-left layout [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | The Kbd style. The product writes the Mac form, "⌘K", which uses Apple's symbols [APL-16]. |
| Platform owns | Shortcut localisation and mirroring, and the standard shortcuts [APL-16]. |
| Not confirmed | How menus display shortcuts: Apple's menu guidance is not in the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

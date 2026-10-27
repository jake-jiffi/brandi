# TextInput on macOS

TextInput is a system text field on macOS, drawn by the system so its text suits every background.

```yaml
component: TextInput
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | A system text field. Apple asks apps to draw text fields with system views, which adjust to vibrancy and appearance [APL-5]. For passwords, a secure text field [APL-13]. The text field API is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. Field heights per control size: not confirmed. |
| Type | SF Pro, Body 13 pt [APL-3]. A placeholder shows an example, never the label. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Text in `textColor` on `textBackgroundColor`, placeholder in `placeholderTextColor` [APL-4]. Selected text in `selectedTextColor` on `selectedTextBackgroundColor`, and the unemphasised pair in a window that is not key [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Rest, focused, invalid, read-only and unavailable. Focus is a ring round the field [APL-15], in `keyboardFocusIndicatorColor` [APL-4]. Invalid and read-only styling: not confirmed. |
| Motion | None of its own [APL-6]. Reduce Motion applies to any custom transition [APL-1]. |
| Accessibility API | VoiceOver. The label comes from its Field [APL-19]. Group the prefix and suffix with the field so they read together [APL-19]. |
| Navigation placement | In a form, a sheet or a toolbar [APL-12] [APL-11]. In a toolbar, standard text fields take corner radii concentric with the bar [APL-11]. |
| Keyboard, pointer, trackpad | Text fields take keyboard focus and show the ring [APL-15]. The horizontal I beam pointer, `iBeam`, shows over text [APL-17]. Standard editing shortcuts keep their meaning, from Command-A to Command-Z [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Size, the border role, prefix and suffix, and the product's focus edge on inputs. The edge departs from Apple's advice to rely on the system focus ring for text fields [APL-15]. The product's guidelines apply (2.3). |
| Platform owns | The focus ring colour [APL-4]. Text selection colours, emphasised and unemphasised [APL-4]. The I beam pointer [APL-17]. Standard editing shortcuts [APL-16]. |
| Not confirmed | The text field API. Field heights. Invalid and read-only styling. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

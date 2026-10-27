# DateRangePicker on macOS

DateRangePicker sets a period for a report on macOS, with what it is compared with, through a control the registry has no page for.

```yaml
component: DateRangePicker
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | Not confirmed. The registry has no page on date pickers. The product's rule is that typing always works, here in two system text fields for start and end [APL-5]. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Body 13 pt [APL-3]. The period says what it is compared with ("vs last month"). No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The chosen range stands out by more than colour [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Closed, open, typing, invalid and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | The calendar or list opens without a slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each end reads its label and full date, and the comparison is part of the label [APL-19]. |
| Navigation placement | In a form, a sheet, or a report's toolbar [APL-12] [APL-11]. |
| Keyboard, pointer, trackpad | Both fields take keyboard focus with a ring [APL-15]. Esc cancels and closes the calendar [APL-16]. Range keys: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Presets, the comparison wording and the calendar's look. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The focus ring on the field [APL-15]. |
| Not confirmed | The native date range control, its styles and its keyboard behaviour. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

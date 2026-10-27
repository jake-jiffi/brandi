# FormActions on macOS

FormActions is the button row that ends a form on macOS: Cancel, then the default button, on the trailing side.

```yaml
component: FormActions
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
  - key: APL-27
    url: https://developer.apple.com/documentation/swiftui/keyboardshortcut/defaultaction
    marker: iOS 14.0+, macOS 11.0+
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
| Native control | A row of push buttons [APL-33]. The primary is the default button, triggered by Return [APL-27]. |
| Target and spacing | Apple's Buttons page asks for a hit region of at least 44 × 44 pt on every platform except visionOS [APL-2]. Its Accessibility page gives macOS controls a 28 × 28 pt default and a 20 × 20 pt minimum, with about 12 pt of padding around a bezelled control [APL-1]. The pages do not say how the two combine, so both are recorded. |
| Type | Match system controls with `controlContentFont(ofSize:)` [APL-3]. The primary names the result ("Save billing"). Apple asks for title-style capitalisation on buttons [APL-2]. The product writes sentence case, and its guidelines apply (2.3). |
| Colour and theme | The default button gets special colouring [APL-27]. A destructive action is a danger button, and Apple's destructive role uses system red [APL-2]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Each button's own states, with a press state on any custom one [APL-2]. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | None of its own [APL-6]. |
| Accessibility API | VoiceOver reads each button's title, with trait `isButton` [APL-19] [APL-23]. |
| Navigation placement | Under a hairline at the end of the form, trailing. Cancel leads the default button [APL-13]. A destructive action sits apart on the leading side. A help button, if any, goes in the lower corner opposite the dismissal buttons [APL-2]. |
| Keyboard, pointer, trackpad | Return triggers the default button [APL-27]. Esc or Command-Period cancels [APL-13]. |
| Haptics | None [APL-18]. |
| Brand may change | Alignment, the hairline and wording. Apple asks for title-style labels [APL-2], and its toolbar guidance names Submit as a key action [APL-11]. The product keeps sentence case and never says Submit (2.3). |
| Platform owns | Return and Esc handling [APL-27] [APL-13]. |
| Not confirmed | Button placement in a macOS sheet: Apple's Sheets page gives it for iOS and iPadOS only [APL-12]. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

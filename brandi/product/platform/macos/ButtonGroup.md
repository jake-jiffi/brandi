# ButtonGroup on macOS

ButtonGroup is a row of related push buttons on macOS, with the default button trailing and Cancel immediately before it.

```yaml
component: ButtonGroup
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | None as one control. It is a row of push buttons [APL-33]. Apple's alert guidance sets the order [APL-13], and toolbars group items into leading, centre and trailing sections [APL-11]. |
| Target and spacing | About 12 pt of padding around each bezelled button [APL-1]. Buttons in a set share one size, and the preferred one stands out by style, not size [APL-2]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | Match system controls with `controlContentFont(ofSize:)` [APL-3]. Apple asks for title-style capitalisation on buttons [APL-2]. The product writes sentence case, and its guidelines apply (2.3). |
| Colour and theme | One or two prominent buttons per view at most [APL-2]. Refrain from colouring the backgrounds of several controls [APL-4]. Custom colours need light, dark and increased-contrast variants [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Each button keeps its own states, with a press state on any custom one [APL-2]. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | None of its own. Wrapping in a narrow window is a layout change. Reduce Motion applies to anything that animates [APL-1]. |
| Accessibility API | VoiceOver reads each button by its title, with trait `isButton` [APL-19] [APL-23]. Group the set so it reads as one [APL-19]. |
| Navigation placement | At the end of a form or dialog. Default button trailing, Cancel leading [APL-13]. Secondary first, primary last, Cancel immediately before the primary. |
| Keyboard, pointer, trackpad | Tab and Shift-Tab move through the buttons under Full Keyboard Access [APL-16]. Return triggers the default button [APL-27]. Esc or Command-Period cancels [APL-13]. |
| Haptics | None for a press [APL-18]. |
| Brand may change | Order, gap and wrapping. The product's order matches Apple's alert order [APL-13]. Apple asks for about 12 pt around bezelled controls [APL-1] and one size of button in a set [APL-2]. |
| Platform owns | Return and Esc handling [APL-27] [APL-13]. Tab order through controls [APL-16]. |
| Not confirmed | A macOS button group control. Spacing between push buttons beyond the general 12 pt padding. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# Dialog on macOS

Dialog is an alert or a sheet on macOS: an alert for a confirmation, a sheet for a short form, both modal to their window.

```yaml
component: Dialog
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
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
```

| Field | Spec |
|---|---|
| Native control | For a confirmation, an alert: `NSAlert` in AppKit, `alert(_:isPresented:actions:)` in SwiftUI [APL-13]. For a short form, a sheet, `presentAsSheet(_:)` [APL-12]. Both are modal to their window [APL-12] [APL-13]. A self-contained task can open a new window instead [APL-12]. |
| Target and spacing | Apple's Buttons page asks for a hit region of at least 44 × 44 pt on every platform except visionOS [APL-2]. Its Accessibility page gives macOS controls a 28 × 28 pt default and a 20 × 20 pt minimum, with about 12 pt of padding around a bezelled control [APL-1]. The pages do not say how the two combine, so both are recorded. |
| Type | Alert title: sentence case and ending punctuation when it is a full sentence, title-style when it is a fragment [APL-13]. Informative text in `messageFont(ofSize:)` [APL-3], short and complete [APL-13]. Button titles in sentence case, no ending punctuation [APL-13]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | macOS shows the app icon in an alert, or an icon or symbol you supply [APL-13]. The caution symbol only when data could be lost unexpectedly [APL-13]. The parent window dims while a sheet is open [APL-12]. Custom colours need light, dark and increased-contrast variants [APL-4]. The default button takes special colouring [APL-27]. |
| States | Open and closed. People rarely resize a sheet, so open it at a sensible size, and allow resizing when more room helps [APL-12]. |
| Motion | System presentation motion [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The title names the dialog and is read first [APL-19]. Its buttons carry `isButton` [APL-23]. |
| Navigation placement | A sheet floats on its parent window [APL-12]. In an alert, the default button trails and Cancel leads [APL-13]. A help button goes in the lower corner opposite the dismissal buttons [APL-2]. One sheet at a time, so never a dialog on a dialog [APL-12]. |
| Keyboard, pointer, trackpad | Return triggers the default button [APL-13] [APL-27]. Esc or Command-Period cancels [APL-13]. People can still bring other app windows forward while a sheet is open [APL-12]. |
| Haptics | None [APL-18]. |
| Brand may change | Width, scrim close, wording and the destructive confirm. Apple asks alert buttons to name the result, and to avoid "OK" unless the alert only informs [APL-13]. A `danger-solid` default meets two Apple rules that disagree: never give a destructive action the primary role [APL-2], and let a deliberately chosen one keep Return without the destructive style [APL-13]. The product's guidelines apply (2.3). |
| Platform owns | Modality to the window, the dimmed parent and the app icon in alerts [APL-12] [APL-13]. Return and Esc [APL-13]. |
| Not confirmed | Button placement in a macOS sheet: Apple's Sheets page gives it for iOS and iPadOS only [APL-12]. Closing by a click outside: no registry page covers it. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

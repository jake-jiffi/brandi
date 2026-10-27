# Dialog on iOS and iPadOS

The product's Dialog becomes an alert on iOS for a focused decision, and a sheet for a short form.

```yaml
component: Dialog
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | An alert for a decision: a title, an optional message, up to three buttons and, when input resolves the situation, a text field [APL-13]. SwiftUI `alert(_:isPresented:actions:)`, UIKit `UIAlertController` [APL-13]. A short form takes a sheet [APL-12]. Choices about an action people started take an action sheet [APL-13]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. |
| Type | An alert's title says what happened, in two lines at most [APL-13]. Keep the title short and the message brief, so the alert does not scroll at large text sizes [APL-13]. |
| Colour and theme | The system draws the alert. A destructive button people did not choose on purpose takes the destructive style, system red [APL-13] [APL-2]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Open and closed. A form with changes is never lost to a stray dismissal: swiping a sheet away with unsaved changes asks to confirm [APL-12]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The system alert handles reading and focus. A custom modal view takes `isModal` [APL-23]. When it closes, the change is reported so VoiceOver keeps its place [APL-19]. |
| Navigation placement | Over the screen. In a row of buttons the default trails and Cancel leads. In a stack the default is on top and Cancel at the bottom [APL-13]. One sheet at a time, so never a dialog on a dialog [APL-12]. On iPhone Duo, alerts and sheets move clear of the fold [APL-20]. |
| Keyboard, pointer, trackpad | Esc or Command-Period cancels an alert on an attached keyboard [APL-13]. Return activates the primary button and can close the alert [APL-2]. |
| Haptics | None specified for alerts. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | A confirmation is a question with the thing and the count, "Delete 3 draft invoices?", and Apple asks a full-sentence title to take sentence case and its punctuation [APL-13]. The primary repeats the verb with the count, in sentence case, as Apple asks for alert buttons [APL-13]. Up to five fields fit the product's dialog. Apple's alert holds a text field only when input resolves the situation [APL-13]. Destructive confirms use `danger-solid`, where Apple asks for the destructive style only on a destructive action people did not choose [APL-13]. The product's guidelines apply (2.3). |
| Platform owns | The alert's layout and drawing [APL-13]. Cancelling with Esc, Command-Period or by leaving for the Home Screen [APL-13]. Moving clear of the fold on iPhone Duo [APL-20]. |
| Not confirmed | Where the product's bottom-rising phone dialog with full-width buttons fits: the alert's anatomy appears only in images, and the Action sheets and Modality pages are not in the registry. Dismissing an alert by tapping outside it. |

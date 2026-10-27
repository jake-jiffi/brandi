# Button on macOS

Button is a push button on macOS, `NSButton.BezelStyle.push` or a SwiftUI `Button`, with the primary variant set as the window's default button.

```yaml
component: Button
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
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-21
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent
    marker: iOS 26.0+, macOS 26.0+
    read: 2026-10-27
  - key: APL-22
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/borderedprominent
    marker: iOS 15.0+, macOS 12.0+
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
  - key: APL-33
    url: https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push
    marker: macOS
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Push button, `NSButton.BezelStyle.push`, the standard macOS button [APL-33] [APL-2]. In SwiftUI, a `Button` [APL-2]. The primary variant is the default button: Return as its key equivalent in AppKit [APL-33], `.keyboardShortcut(.defaultAction)` in SwiftUI [APL-27]. `borderedProminent` runs from macOS 12.0 and `glassProminent` from macOS 26.0 [APL-22] [APL-21]. Use `NSButton.BezelStyle.flexiblePush` only for two lines or a tall icon [APL-2]. |
| Target and spacing | Apple's Buttons page asks for a hit region of at least 44 × 44 pt on every platform except visionOS [APL-2]. Its Accessibility page gives macOS controls a 28 × 28 pt default and a 20 × 20 pt minimum, with about 12 pt of padding around a bezelled control [APL-1]. The pages do not say how the two combine, so both are recorded. |
| Type | Match system controls with `controlContentFont(ofSize:)` [APL-3]. One to three words, verb first. End the title with an ellipsis when the button opens another window, view or app [APL-2]. Apple asks for title-style capitalisation on buttons [APL-2] and sentence-style on alert buttons [APL-13]. The product writes sentence case, and its guidelines apply (2.3). No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The primary role takes the app accent and the destructive role takes system red [APL-2]. The default button gets special colouring, and only the first control with the default shortcut is emphasised [APL-27]. One or two prominent buttons per view [APL-2]. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Rest, pressed, focused and unavailable. Always draw a press state on a custom button [APL-2]. Unavailable: text in `disabledControlTextColor` [APL-4]. A tooltip, when set, appears after a short hover [APL-2]. Apple's guidance on a spinner inside a button covers iOS and iPadOS only [APL-2], so the product's loading state (width kept, spinner, presses ignored) rests on the product's rule. |
| Motion | Standard buttons bring their own motion [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton`, macOS 10.15 and later [APL-23]. The label is the visible title, and an icon-only button needs a descriptive one [APL-19]. When loading changes the label, report it with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In an alert, the default button trails and Cancel leads [APL-13], which matches the product's order: secondary, then primary, with Cancel immediately before it. In a toolbar, one `.prominent` action on the trailing side, with no bezel, and every toolbar command also in the menu bar [APL-11]. |
| Keyboard, pointer, trackpad | Return triggers the default button [APL-27]. Esc or Command-Period cancels [APL-13]. Full Keyboard Access reaches every control, so custom focus is only for content such as list items, text fields and search fields [APL-15] [APL-16]. A push button can support spring loading: people force click it while dragging items over it [APL-2]. |
| Haptics | None for a press. Mac trackpad haptics cover drags and force clicks only [APL-18]. |
| Brand may change | Variants, tint, label wording and the pill shape, inside the floors. Push buttons can be tinted [APL-2], and the accent shows only under Multicolor [APL-4]. Sentence case departs from Apple's title-style [APL-2]. A `danger-solid` confirm set as the default button departs from Apple's rule that a destructive action never takes the primary role [APL-2]. In a toolbar, the pill departs from corner radii concentric with the bar [APL-11]. The product's guidelines apply (2.3). |
| Platform owns | Bezel style, control size and the default button's colouring [APL-2] [APL-27]. The accent replacement outside Multicolor [APL-4]. The focus ring in `keyboardFocusIndicatorColor` [APL-4]. Full Keyboard Access [APL-16]. |
| Not confirmed | Push button heights per control size. Disabled styling beyond the text colour. The activation key for a focused button that is not the default. How the 44 pt hit region and the 28 pt control size combine. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

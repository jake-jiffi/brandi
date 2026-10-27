# IconButton on macOS

IconButton is an icon-only button on macOS: an image button in a view, or a toolbar item in the window frame.

```yaml
component: IconButton
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
| Native control | In a view, an image button: it shows a symbol or image and can act as a push button, toggle or pop-up button [APL-2]. Image buttons stay out of the window frame, so in a toolbar it is a toolbar item [APL-2] [APL-11]. Beside a table, a square button, which holds symbols only [APL-2]. |
| Target and spacing | About 10 pixels of padding between the image and the button's edges, which define its clickable area even when unseen [APL-2]. Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | No visible text. A label, when shown, sits below an image button [APL-2]. The tooltip uses `toolTipsFont(ofSize:)` [APL-3]. |
| Colour and theme | Prefer system symbols, which take the right colour at rest and as people interact [APL-2]. Avoid a system-provided border on an image button [APL-2]. Never colour alone: a word, shape or icon carries the meaning too [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Rest, pressed and unavailable. Draw a press state on any custom button [APL-2]. Toolbar symbols get hover and selection appearances from the system [APL-11]. The unavailable look of a symbol: not confirmed. |
| Motion | System controls bring their own motion, quieter under a trackpad than under touch [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton` [APL-23]. The required `label` is its name. System controls have generic labels, so give a descriptive one, such as "More actions for [record]" [APL-19]. Voice Control depends on it too [APL-1]. |
| Navigation placement | In a view for actions on that view. Square buttons sit within or beneath the view they act on [APL-2]. In the toolbar as a toolbar item, with every toolbar command also in the menu bar [APL-11]. Keep symbol items apart from text-labelled ones [APL-11]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches it [APL-16]. After a short hover the system shows a tooltip, which carries the product's label [APL-2]. |
| Haptics | None for a press [APL-18]. |
| Brand may change | The icon set and the ghost variant. Apple asks for familiar symbols for familiar actions [APL-2], and for system symbols without borders in toolbars [APL-11]. |
| Platform owns | Tooltip timing [APL-2]. Toolbar hover and selection appearances, and the overflow menu when items no longer fit [APL-11]. |
| Not confirmed | The unavailable appearance of a symbol. Square and image button sizes. The activation key for a focused button that is not the default. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

# ProductLockup on iOS and iPadOS

The mark with the product's name on iOS is a grouped image and text element at the top of the iPad sidebar, on sign-in and in product emails.

```yaml
component: ProductLockup
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
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is an image beside a text label, read as one element [APL-19]. |
| Target and spacing | With `href` the whole lockup is one link. Hit region at least 44 × 44 pt [APL-2]. Without it nothing is pressed. |
| Type | If the name is live text, it uses a text style [APL-3]. Apple notes that interface chrome need not grow with text size, as tab titles do not [APL-3]. How the name is set is the product's decision. |
| Colour and theme | As Logo: right in both appearances, or separate light and dark assets [APL-5]. The name's colour keeps 4.5:1 against its background [APL-1]. |
| States | None beyond its link's press state [APL-2]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. One element named "[Brand] [product]", so the mark and the name are not read twice [APL-19]. As a link it takes `isLink` in SwiftUI or `.link` in UIKit [APL-23] [APL-29]. |
| Navigation placement | iPadOS: the top of the sidebar, on the leading side [APL-10]. On iPhone the tab bar usually carries navigation [APL-9], since a sidebar needs a large amount of space [APL-10]. Apple asks apps not to use the app's name as a window's title [APL-11]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. As a link, the pointer takes the highlight effect if its background is transparent [APL-17]. |
| Haptics | None specified for a lockup. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The mark, the name as people say it, `inline` or `stacked` layout and its height. One per screen. The product puts the lockup in the phone top bar of its web shell. Apple asks apps not to show the logo throughout, and not to use the app's name as a window's title [APL-8] [APL-11]. Where the product keeps it there, its guidelines apply (2.3). |
| Platform owns | The sidebar's position, its Liquid Glass layer and whether people hide it [APL-10] [APL-7]. |
| Not confirmed | Where the lockup sits on iPhone when the app uses a tab bar: no registry page places a brand lockup in iOS navigation. |

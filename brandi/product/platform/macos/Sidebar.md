# Sidebar on macOS

Sidebar is the macOS sidebar: the leading pane of a split view, for moving between areas of the app.

```yaml
component: Sidebar
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | A sidebar in the leading pane of `NavigationSplitView` or `NSSplitViewController` [APL-10]. |
| Target and spacing | Row height, text and symbol size follow the sidebar size: small, medium or large [APL-10]. People change it with the sidebar icon size in General settings [APL-10]. |
| Type | Text size follows the sidebar size [APL-10]. Group titles succinct and descriptive [APL-10]. |
| Colour and theme | Icons take the app accent [APL-10]. The person's accent replaces it unless a fixed colour carries meaning [APL-4] [APL-10]. Liquid Glass is more opaque in large elements like sidebars [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Shown, hidden, and the product's icons-only width. The row in hand carries the selection highlight [APL-15]. |
| Motion | System show and hide motion [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group the navigation under a heading [APL-19]. The account button is named "[name], [role], account menu" [APL-19]. Collapsed, the labels stay available to VoiceOver [APL-19]. |
| Navigation placement | The leading side [APL-10]. The product puts settings, help and the signed-in person in the footer. Apple asks apps to keep critical information and actions off the bottom, which a moved window can hide [APL-10]. |
| Keyboard, pointer, trackpad | Show Sidebar and Hide Sidebar in the View menu, or a button [APL-10]. Sidebar items take focus as content [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Rail tokens, the collapsed width, eight items at most and uppercase group labels. Apple asks for two levels at most and succinct group titles [APL-10]. Settings, help and the account in the footer depart from Apple's advice to keep critical actions off a sidebar's bottom [APL-10]. The product's guidelines apply (2.3). |
| Platform owns | Sidebar size from General settings [APL-10]. The accent replacement on icons [APL-4]. Liquid Glass [APL-7]. |
| Not confirmed | An icons-only sidebar state on macOS. Keyboard movement between sidebar rows. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

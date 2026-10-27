# PageHeader on macOS

PageHeader is the top of a view on macOS, where the window's toolbar carries the title and the actions.

```yaml
component: PageHeader
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | The toolbar: the view title at the leading edge or in the centre, the actions and the primary at the trailing edge [APL-11]. |
| Target and spacing | Toolbar items meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Window title in `titleBarFont(ofSize:)` [APL-3], under 15 characters [APL-11]. The title is the noun people use, never the app's name [APL-11]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The toolbar floats on Liquid Glass [APL-7]. Keep custom toolbar backgrounds and tinted controls to a minimum [APL-11]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | None of its own. |
| Motion | None of its own [APL-6]. |
| Accessibility API | VoiceOver. The title is read first, so make it unique for each window [APL-19]. |
| Navigation placement | The toolbar in the window frame [APL-11]. One primary on the trailing edge, in the `.prominent` style [APL-11]. Tabs sit under it. |
| Keyboard, pointer, trackpad | Control-F5 moves focus to the toolbar [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Title style, breadcrumbs, description and meta. Apple asks for titles under 15 characters and few custom toolbar backgrounds [APL-11]. The product's long titles wrap, which a macOS toolbar title does not settle. |
| Platform owns | Toolbar layout, overflow and customisation [APL-11]. |
| Not confirmed | Where a description line goes in a macOS toolbar. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

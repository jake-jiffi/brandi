# Root on macOS

Root has no single native control on macOS: its job (theme, base type and the shortcut setting) falls to the system appearance and to every window it wraps.

```yaml
component: Root
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The registry names no root container. Dark Mode reaches every window, view, menu and control, and semantic colours such as `labelColor` and `controlColor` adapt to it [APL-5]. Root sets what the system leaves to the app. |
| Target and spacing | None of its own. Root adds no padding. Every control inside it meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | SF Pro is the system font, Body 13 pt on 16 pt by default and never under 10 pt [APL-3] [APL-1]. Reach it through `Font.Design.default`, never an embedded copy [APL-3]. A brand font must support Bold Text as the system font does [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | People choose light, dark or Auto, and Auto can switch while the app runs [APL-5]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. Apple's Accessibility page asks for 4.5:1 for text up to 17 pt and 3:1 for 18 pt or bold text [APL-1]. Its Dark Mode page sets 4.5:1 as the floor for every pair, and asks custom colours to strive for 7:1, especially in small text [APL-5]. The two pages disagree on large and bold text, so both are recorded. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. |
| States | No interactive states. Root sets the text and selection colours: `labelColor` for primary text, `selectedTextColor` on `selectedTextBackgroundColor`, and the unemphasised pair in a window that is not key [APL-4]. |
| Motion | Root adds no motion. It passes Reduce Motion down to everything inside [APL-24], which then shows less automatic and repeating animation, and fades in place of slides [APL-1]. |
| Accessibility API | VoiceOver. Root is not an element itself. Each window it wraps carries a unique, useful title, because the title is the first thing VoiceOver reads [APL-19] [APL-11]. |
| Navigation placement | None. Root has no position. It wraps the content of each window, and each window takes a useful title that is never the app's name [APL-11]. |
| Keyboard, pointer, trackpad | Root's shortcut setting turns off single-key shortcuts. Control-F1 turns Full Keyboard Access on or off, and it reaches every control [APL-16]. Never repurpose a standard shortcut, such as Command-Comma for settings [APL-16]. |
| Haptics | None. Root plays nothing, and Apple asks that any haptic stay optional [APL-18]. |
| Brand may change | The theme (light by default, dark as a full theme people choose, never per screen), the body face and the shortcut setting. Where the product offers its own theme choice, it departs from Apple's guidance to follow the systemwide appearance with no app-specific setting [APL-5]. Single-key shortcuts depart from Apple's advice to lead custom shortcuts with Command [APL-16]. The product's guidelines apply (2.3). |
| Platform owns | The systemwide appearance and its Auto switching [APL-5]. Desktop tinting under the graphite accent [APL-5]. The accent replacement outside Multicolor [APL-4]. Standard keyboard shortcuts [APL-16]. |
| Not confirmed | A root container API: the registry names none. Scroll bar behaviour outside a `Table`. Inside one, the "Show scroll bars" preference decides [APL-26]. A system text-size setting for Mac apps: the registry says only that macOS has no Dynamic Type. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

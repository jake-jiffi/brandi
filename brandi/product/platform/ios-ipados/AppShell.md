# AppShell on iOS and iPadOS

The frame of the product on iOS is a tab bar on iPhone and a tab bar that can become a sidebar on iPad, with the content beside or behind it.

```yaml
component: AppShell
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
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
| Native control | SwiftUI `TabView` or UIKit `UITabBar` for the tab bar [APL-9]. On iPad, the `sidebarAdaptable` style switches between tab bar and sidebar [APL-9] [APL-10]. A sidebar-only shell uses `NavigationSplitView` or `UISplitViewController` [APL-10]. |
| Target and spacing | Lay out with size classes, layout margins and safe area insets, never fixed widths [APL-20]. Tab bar and sidebar items meet the 44 × 44 pt default [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Tab titles need not grow with the text, as Apple's example of a tabbed window shows [APL-3]. |
| Colour and theme | The tab bar and sidebar float on Liquid Glass above the content [APL-7] [APL-9]. Over colourful content, a monochrome tab bar or an accent with enough contrast [APL-9]. Sidebar icons take the app accent by default [APL-10]. |
| States | iPhone: a tab bar with an accessory can minimise as people scroll [APL-9]. iPad: tab bar or sidebar, switched by a button [APL-9]. iPhone Duo: bars move to the side on the outer display [APL-20]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Unique screen titles and accurate headings let people find their place, and the rotor moves by heading [APL-19]. The tab bar takes `.tabBar` in UIKit [APL-29]. The web's skip link has no counterpart in the registry. |
| Navigation placement | iPhone: the tab bar floats at the bottom [APL-9]. iPad: the tab bar sits near the top and can become a sidebar on the leading side [APL-9] [APL-10]. iPhone Duo: toolbars and tab bars move to the side on the outer display, and split views expand on the inner one [APL-20]. |
| Keyboard, pointer, trackpad | iPadOS: Tab moves between focus groups such as the sidebar and a list [APL-15]. People hide and show the sidebar with the edge swipe [APL-10]. Tab bars take the pointer highlight effect [APL-17]. |
| Haptics | None specified for the shell. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The rail's contents, the lockup and the groups. The web shell's drawer and phone action bar do not match Apple's containers, which are the tab bar and the sidebar [APL-9] [APL-10], and actions go in a toolbar, never the tab bar [APL-9]. Where the product keeps its drawer, its guidelines apply (2.3). |
| Platform owns | Tab bar placement, Liquid Glass and the More tab for overflow [APL-9]. Sidebar conversion on iPad [APL-9]. Vertical bars on iPhone Duo [APL-20]. |
| Not confirmed | How the product's eight top-level items fit a tab bar that Apple asks to keep short, five or fewer by default when people customise it on iPad [APL-9]. The Split views and Layout pages are not in the registry. |

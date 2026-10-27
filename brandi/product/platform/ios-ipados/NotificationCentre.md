# NotificationCentre on iOS and iPadOS

The events for the signed-in person on iOS open from a toolbar button into a list, with a count on the button.

```yaml
component: NotificationCentre
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
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. The closest pattern is a list [APL-14], opened in a sheet from a toolbar button [APL-12]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | A count says how many in words as well as colour [APL-1]. Apple's tab badge, a red oval, is for critical information only [APL-9]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Unread and read. A new event is announced once, politely [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The button's label includes the count in words, such as "Notifications, 3 need you" [APL-19]. Unread rows add "(unread)" [APL-19]. A new event posts one `AccessibilityNotification` [APL-19]. |
| Navigation placement | From the toolbar or the sidebar. On iPhone Duo, items with badges stay visible longer as the bar compresses [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A focused list row draws white text on an accent-colour highlight [APL-15]. |
| Haptics | Not confirmed: no registry page covers in-app event haptics. Notification haptics report a task's outcome [APL-18], which is a different job. |
| Brand may change | The highlight and grey counts, the line format (who did what) and the assistant's `ai` tone. Apple's badge is red and only for critical information [APL-9]. The product's counts depart from that, and its guidelines apply (2.3). |
| Platform owns | Bar compression, and which items stay visible [APL-20]. |
| Not confirmed | Push notifications and how they link to this list: the Notifications page is not in the registry. Haptics for in-app events. |

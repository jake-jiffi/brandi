# ProductLockup on Windows

The mark with the product's name, placed at the top of the navigation pane and on sign-in.

```yaml
component: ProductLockup
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No lockup control. One element holding the mark (`Image`) [WIN-19] and the name, placed in NavigationView's `PaneHeader` [WIN-15]. `PaneTitle` would put its text next to the menu button, ahead of anything in `PaneHeader` [WIN-15], which reverses the lockup. |
| Target and spacing | As a link, the whole lockup takes the 40 × 40 px touch target [WIN-2]. Spacing on the 4 epx grid [WIN-16]. |
| Type | The name never larger than the mark. Body Strong, 14 on 20 epx Semibold, suits a title in a confined space [WIN-4] [FLU-3]. The name scales to 225% and the mark does not [WIN-6]. Microsoft's truncation guidance conflicts. Typography asks for ellipses in most cases in one table and shows clipping as the Do in another section [WIN-5]. Text scaling prefers clipping, with a tooltip carrying the full text [WIN-6]. |
| Colour and theme | Approved renditions only. In contrast themes the name takes `SystemColorWindowTextColor`, or `SystemColorHotlightColor` when the lockup is a link, since that colour is kept for hyperlinks [WIN-9]. |
| States | Static, or a link's states when it carries `href` [WIN-13]. Link states: not confirmed. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. As a link it has one name for the whole lockup, "[Brand] [product]", through `AutomationProperties.Name` [WIN-19], and the mark inside it is decorative, `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | Top of the NavigationView pane, in `PaneHeader` [WIN-15]. One per screen. |
| Keyboard, pointer, trackpad | As a link, Tab reaches it and Enter activates it [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Inline with a hairline or stacked, the name as people say it, and a long name cut with an ellipsis rather than widening the pane. Ellipses depart from Text scaling's preference for clipping [WIN-6], and the product's guidelines apply (2.3). |
| Platform owns | The pane header slot and its place beside the menu button [WIN-15]. Contrast theme colours [WIN-9]. |
| Not confirmed | SVG support in `Image`. Link visual states. Lockup guidance on Microsoft's title bar and iconography pages, which the registry does not hold. |

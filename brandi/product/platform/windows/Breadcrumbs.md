# Breadcrumbs on Windows

The trail that shows where a record sits, for pages two or more levels deep.

```yaml
component: Breadcrumbs
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
| Native control | WinUI `BreadcrumbBar`, named only as a related link on the NavigationView page [WIN-15], with no guidance in the registry. Closest documented pattern: `HyperlinkButton`s, since each step navigates [WIN-13]. |
| Target and spacing | Each link takes the 40 × 40 px touch target [WIN-2]. |
| Type | Body or Caption [WIN-4] [FLU-3]. Microsoft's truncation guidance conflicts. Typography asks for ellipses in most cases in one table and shows clipping as the Do in another section [WIN-5]. Text scaling prefers clipping, with a tooltip carrying the full text [WIN-6]. |
| Colour and theme | In contrast themes, links take `SystemColorHotlightColor` and the current page `SystemColorWindowTextColor` [WIN-9]. |
| States | Links, then the current page as plain text, which takes `SystemColorWindowTextColor` in contrast themes [WIN-9]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each link is named by its text [WIN-19]. Narrator has a links view [WIN-17]. |
| Navigation placement | Above the page title, in the page content below NavigationView's header [WIN-15]. |
| Keyboard, pointer, trackpad | Tab moves between links, and Enter activates one [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Two or more levels deep only, the last item never a link, and names cut at 28 characters with the full name on hover. The ellipsis departs from Text scaling's preference for clipping, where Microsoft gives the full text through a tooltip [WIN-6], and the product's guidelines apply (2.3). |
| Platform owns | Hyperlink colour in contrast themes [WIN-9]. |
| Not confirmed | `BreadcrumbBar` guidance, overflow and automation. The full name's route for touch and keyboard. Haptic guidance. |

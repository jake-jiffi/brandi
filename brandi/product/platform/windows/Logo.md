# Logo on Windows

The brand's mark from the master artwork, shown as an image, since WinUI has no logo control.

```yaml
component: Logo
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-18
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
    marker: 2026-10-04
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
| Native control | No logo control. Show the master artwork in an `Image` element [WIN-19]. NavigationView's `PaneHeader` takes any element, an image or logo included [WIN-15]. |
| Target and spacing | Not pressable unless it sits in a link, which then takes the 40 × 40 px touch target [WIN-2]. Placement on the 4 epx grid [WIN-16]. |
| Type | None. The mark is artwork, and text scaling resizes only text [WIN-6]. |
| Colour and theme | Users can and do change contrast theme colours [WIN-9], so the mark's rendition has to hold on whatever `SystemColorWindowColor` they pick. Light and dark follow the user's setting [WIN-8]. |
| States | None. The mark has no interactive states and never takes focus, since an `Image` is not a `Control` [WIN-18]. |
| Motion | None. The product's logo rules allow no effects, so the animations setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. An `Image` has no alt attribute, so its name comes from `AutomationProperties.Name` [WIN-19]. Inside a link that already names it, the mark is decorative: no name, and `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | The NavigationView pane header, `PaneHeader` [WIN-15], and sign-in. Never the page header. |
| Keyboard, pointer, trackpad | Not focusable, since only classes derived from `Control` take focus [WIN-18]. A logo link takes focus as a link. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Everything about the mark: master artwork, approved renditions, clear space and minimum size all come from the brand's logo system. In product it sits in the pane lockup and on sign-in only. No Microsoft guidance covers an app's own logo beyond the `PaneHeader` slot [WIN-15]. |
| Platform owns | Effective-pixel scaling of the image [WIN-16]. The contrast theme colours around it [WIN-9]. |
| Not confirmed | SVG support in `Image`. Which rendition to show in each contrast theme. App icon and title bar icon guidance, which sits on pages outside the registry. |

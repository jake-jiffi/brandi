# Avatar on Windows

A person as a photo or initials on a tinted circle, drawn with the pattern Microsoft's samples use.

```yaml
component: Avatar
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-7
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color
    marker: 2026-10-13
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
| Native control | No control in the registry's pages. The theming sample draws the pattern: an `Ellipse` filled by an `ImageBrush`, 48 × 48, at the start of a list item [WIN-8]. Microsoft's spacing page calls these person picture elements [WIN-4]. |
| Target and spacing | Not pressable on its own. Sizes on the 4 epx grid [WIN-16]. Multi-line lists use 32 epx icons [WIN-4]. |
| Type | A label under a person picture in a grid item is Caption, centred [WIN-4]. The initials' text style: not confirmed. |
| Colour and theme | Theme brushes for the tint [WIN-8]. Status never by colour alone [WIN-7]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | Presence shown by more than colour [WIN-7]. Presence colours: not confirmed. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. An image takes its name from `AutomationProperties.Name` [WIN-19], here the person's name with their status ("[Name], online"). Where the name already sits beside it as text, the picture is decorative, `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | List items, headers and records. The theming sample puts it at the start of a list item, 12 epx before the text [WIN-8]. |
| Keyboard, pointer, trackpad | Not focusable, since it is not a `Control` [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Photo or initials on a tinted circle, the product's sizes, the assistant's own avatar, and the status dot. The circle is the product's one shape exception, and Microsoft's sample is a circle too [WIN-8]. |
| Platform owns | Image scaling across display plateaus [WIN-16]. Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party person picture control. The initials' text style. Presence colours. |

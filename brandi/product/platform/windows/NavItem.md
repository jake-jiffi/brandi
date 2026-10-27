# NavItem on Windows

One destination in the navigation pane, built on `NavigationViewItem`.

```yaml
component: NavItem
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
    marker: undated
    read: 2026-10-27
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | WinUI `NavigationViewItem`, with `Icon` and `Content` [WIN-15]. A `sub` item nests in its `MenuItems` [WIN-15]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | The selected item draws its indicator on the left edge in Left mode and the bottom edge in Top mode [WIN-15]. In contrast themes, selection and hover take the highlight pair [WIN-9]. |
| States | Selected, pointer over, pressed and disabled. One item is selected at a time across `MenuItems` and `FooterMenuItems` [WIN-15]. `SelectsOnInvoked` false keeps an item from showing selection [WIN-15]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Name from the label, with the count in words ("Approvals, 3 need you"), through `AutomationProperties.Name` [WIN-19]. How the current page is exposed: not confirmed. |
| Navigation placement | In NavigationView's `MenuItems` or `FooterMenuItems` [WIN-15]. |
| Keyboard, pointer, trackpad | Space or Enter invokes and selects it [WIN-15]. `ItemInvoked` fires on every invoke, even when the item is already selected, so guard against reloading the page [WIN-15]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Counts mean work: a highlight count waits on the reader, a grey one on others, and zero shows nothing. The current page takes `rail-selected` with a hairline. The highlight count's text is solved for contrast, as Fluent requires [FLU-4]. |
| Platform owns | The selection model and indicator [WIN-15]. Invoke events [WIN-15]. |
| Not confirmed | A count badge on `NavigationViewItem`. How the current page is exposed in UI Automation. Haptic guidance. |

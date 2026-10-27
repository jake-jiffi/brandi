# FileDrop on Windows

A drop zone with a real button, so nobody depends on dragging, built from a `Button` and a drop target because WinUI has no drop zone control.

```yaml
component: FileDrop
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
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
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
  - key: WIN-20
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No drop zone control. A `Button` that opens the Storage Pickers, such as `FileOpenPicker` [WIN-13] [WIN-25], plus a drop target on the zone. ListView and GridView take drag and drop between themselves [WIN-22]. Dropping files from outside the app: not confirmed. |
| Target and spacing | The button takes the 40 × 40 px touch target [WIN-2]. Spacing on the 4 epx grid [WIN-16]. |
| Type | Title in Body Strong, the rule in Body [WIN-4] [WIN-5]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, add a border only where the zone's boundary matters [WIN-9]. |
| States | Rest, drag over and error, plus the button's own states [WIN-8]. Drag-over styling: not confirmed. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The browse button has control type Button and takes its name from its visible text ("Choose files") [WIN-19] [WIN-20]. The rule in words goes in `AutomationProperties.HelpText` [WIN-19]. How an error is announced: not confirmed. |
| Navigation placement | Page content or a form. Its errors stay inline on the page [WIN-14]. |
| Keyboard, pointer, trackpad | The button is the keyboard and Narrator path, since anything a pointer can do needs a keyboard way too [WIN-18]. Enter or Space opens the picker [WIN-13]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The title, the rule in words ("CSV or XLSX, up to 20 MB"), "Choose files", and a wrong file rejected with the reason and the fix. Microsoft's rule that pointer actions need a keyboard equal backs the button [WIN-18]. |
| Platform owns | The picker dialog, and focus returning to the app when it closes, which Windows App SDK 2.4.0 fixed [WIN-25]. |
| Not confirmed | File picker guidance. Drop target APIs for files from outside the app. Drag-over styling. How an error is announced. Haptic guidance. |

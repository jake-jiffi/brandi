# PageHeader on Windows

The top of every page: breadcrumbs, the title and its badges, a description, actions and tabs.

```yaml
component: PageHeader
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
| Native control | NavigationView's `Header`, which holds the selected page's title [WIN-15], with its margin set through `NavigationViewHeaderMargin` [WIN-15]. Breadcrumbs, description, actions and tabs sit in the page content below it. |
| Target and spacing | Actions take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | The title in Title, 28 on 36 epx [WIN-5] [FLU-3]. The description in Body [WIN-5]. Sentence case for all UI text [WIN-5]. Long titles wrap [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | None of its own. Each control inside draws its own states, and a disabled one leaves the tab order [WIN-18]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The title is static text [WIN-19]. Narrator's headings view needs it marked as the page's top heading [WIN-17]. How: not confirmed. |
| Navigation placement | The header docks to the top, clips the content as it scrolls, and has a fixed height of 52 px [WIN-15]. It always shows in Minimal mode, and `AlwaysShowHeader` false hides it in the others [WIN-15]. |
| Keyboard, pointer, trackpad | Actions take Enter or Space [WIN-13]. The primary gets an access key [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One title per screen, the noun people use and never "Dashboard", one primary at most on the right, secondary actions beside it, and actions dropping below the title on narrow windows. NavigationView's header has a fixed 52 px height [WIN-15] while text scales to 225% [WIN-6], so a wrapping title belongs in page content when it outgrows the header. |
| Platform owns | The header's height, docking and visibility rules [WIN-15]. |
| Not confirmed | Heading semantics in UI Automation. How the header copes with text scaling. A command bar for page actions. Haptic guidance. |

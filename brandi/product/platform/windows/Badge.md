# Badge on Windows

One or two words of state on a record, read and never pressed, drawn as styled text because the registry names no badge control.

```yaml
component: Badge
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
  - key: WIN-7
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
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
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No badge control in the registry's pages. A `TextBlock` in a small rounded container [WIN-19], with the word carrying the meaning [WIN-7]. |
| Target and spacing | Not pressable. Spacing on the 4 epx grid [WIN-16]. |
| Type | Caption, 12 on 16 epx, suits confined spaces [WIN-4] [FLU-3]. Never below 12 px Regular [WIN-5]. Sentence case for all UI text [WIN-5]. Microsoft's truncation guidance conflicts. Typography asks for ellipses in most cases in one table and shows clipping as the Do in another section [WIN-5]. Text scaling prefers clipping, with a tooltip carrying the full text [WIN-6]. |
| Colour and theme | Tones never carry meaning alone [WIN-7]. Text at 4.5:1, and the badge at 3:1 against adjacent colours [FLU-4]. In contrast themes, tone colours give way to `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. Corners 4 px, the in-page radius [WIN-12]. |
| States | None. A badge is read, not pressed, so it is never a tab stop [WIN-17]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text, named by its own words [WIN-19]. Inside a list item, a status that changes while on screen belongs in the item's `ItemStatus` property [WIN-21]. |
| Navigation placement | Beside record titles, in list rows and table cells, and in the page header beside the title [WIN-15]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The seven tones and their words, the same word for a state in every product, sentence case, no full stop, and a long label cut with an ellipsis that shows in full on hover. Ellipses depart from Text scaling's preference for clipping [WIN-6], and the product's guidelines apply (2.3). |
| Platform owns | Contrast theme colours, which replace every tone [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | A first-party status badge control. The full label's route for touch and keyboard when it is cut short. |

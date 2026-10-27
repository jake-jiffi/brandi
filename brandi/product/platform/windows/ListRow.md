# ListRow on Windows

One record in a List, built as a `ListView` item template.

```yaml
component: ListRow
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A `ListView` item template [WIN-22]. The theming sample's template is 64 high, with a 48 × 48 picture, a Body Strong title and a Body second line [WIN-8]. |
| Target and spacing | The row takes the 40 × 40 px touch target [WIN-2]. 12 epx between the picture and the text, as in the sample [WIN-8]. |
| Type | Body and Caption for multi-line rows, with 32 epx icons [WIN-4]. The title in `BodyStrongTextBlockStyle` [WIN-8]. Microsoft's truncation guidance conflicts. Typography asks for ellipses in most cases in one table and shows clipping as the Do in another section [WIN-5]. Text scaling prefers clipping, with a tooltip carrying the full text [WIN-6]. |
| Colour and theme | Secondary text through a theme brush such as `TextFillColorTertiaryBrush` [WIN-8]. In contrast themes, rows invert to `SystemColorHighlightColor` on hover, press and selection. A hard-set `TextBlock.Foreground` breaks that, so set secondary text through a theme dictionary style that drops the setter in HighContrast [WIN-9]. |
| States | Selected, unread, pointer over and pressed. In contrast themes, selection and interaction take the highlight pair [WIN-9]. |
| Motion | None of its own. Check `UISettings.AnimationsEnabled` before animating one [WIN-11]. |
| Accessibility API | Narrator through UI Automation. A DataItem named by its primary text, with `ItemType` saying what it is and `ItemStatus` for a status that changes on screen [WIN-21]. A ListItem instead when the row is selectable [WIN-21]. Set the name on the template root, as the sample does [WIN-8], with "(unread)" added. |
| Navigation placement | Inside a List, in a list pane or page content [WIN-22]. |
| Keyboard, pointer, trackpad | Enter selects like Space unless the row has an extra action [WIN-17]. With `IsItemClickEnabled`, clicking the row raises `ItemClick` instead of selecting it [WIN-22]. |
| Haptics | Not confirmed. |
| Brand may change | The lead, the title, and a meta line that answers "what is it, and what is next". A badge never squeezed to its dot, the selected look (`selected-strong` with a `selected-line` edge), and two lines under the product's 480 px list width. Cutting long text with an ellipsis departs from Text scaling's preference for clipping [WIN-6], and the product's guidelines apply (2.3). |
| Platform owns | Row selection [WIN-22] and its inversion in contrast themes [WIN-9]. |
| Not confirmed | Row heights other than the sample's. The full text's route for touch and keyboard when a row is cut short. Haptics. |

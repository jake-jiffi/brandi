# AIProposal on Windows

The assistant asking before it acts, with nothing happening until a person presses the button.

```yaml
component: AIProposal
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
| Native control | No control. A card region with a heading, the records as a read-only `ListView` [WIN-22], and `Button`s [WIN-13]. |
| Target and spacing | Buttons take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Title in Subtitle or Body Strong, and records in Body and Caption [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | The waiting state's colour also shows as the Needs you badge's word, never colour alone [WIN-7]. In contrast themes the card keeps a border where its boundary matters [WIN-9]. |
| States | Needs you, In progress, Done, Failed and Not done, each a word [WIN-7]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before adding any [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The card's root takes its heading as a name through `AutomationProperties.Name`, the way Microsoft names regions [WIN-18]. The action button's name carries the verb and the count ("Send 2 reminders") [WIN-19]. Not now, Edit and Try again carry the question as help text, so Narrator knows what they act on [WIN-19]. How the outcome is announced: not confirmed. |
| Navigation placement | In the answer it belongs to, one waiting at a time. Windows commit order puts the action first, then Edit, then Not now as the safe action last [WIN-13] [WIN-14]. |
| Keyboard, pointer, trackpad | Buttons take Enter or Space [WIN-13]. After a press, code moves focus to the outcome [WIN-17]. Initial focus never lands on an action with a serious outcome [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Used whenever the assistant would send, pay, approve, change another system or delete. A title that asks a question with the thing and the count, and a note that nothing happens until the press. Five records at most, and the action as the only primary on screen while it waits. The product's web reading order (Not now, Edit, then the action) stays on the web, because the product never shares one order across platforms [WIN-13]. |
| Platform owns | Commit order [WIN-13]. Contrast theme colours [WIN-9]. |
| Not confirmed | How the outcome is announced. Region semantics beyond a named root. Haptic guidance. |

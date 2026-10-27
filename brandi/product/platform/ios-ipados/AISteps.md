# AISteps on iOS and iPadOS

What the assistant is doing on iOS shows step by step, open while it works and folded to one line when it is done.

```yaml
component: AISteps
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-2
    url: https://developer.apple.com/design/human-interface-guidelines/buttons
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is a disclosure control, which Apple uses to show and hide groups [APL-10]. The Disclosure controls page and the API: not confirmed. |
| Target and spacing | The summary line and Try again are buttons with hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Each step says its state in words, never colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Each step is done, running, waiting, failed or skipped. The summary reads "Working, step 2 of 4", then folds when the run ends, unless the person opened or closed it. A failure reads "Failed at step 2 of 3". The start, a failure and the end are reported to VoiceOver, never every change [APL-19]. |
| Motion | One spinner at a time: the summary spins only while the list is folded. Under reduced motion the product slows it rather than stopping it, and folding fades instead of sliding [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The summary is a button, `isButton` or `.button` [APL-23] [APL-29]. Post an `AccessibilityNotification` at the start, on a failure and at the end [APL-19]. Every step label is plain text, read as words [APL-19]. |
| Navigation placement | Inside an AIAnswer, or on its own in a Card titled with the job's name, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | After Try again, focus moves to the summary line. That follows a press [APL-15]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for the steps log. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Step names, in the person's words, and the step in hand as it happens ("Comparing [records] with [source]"). `detail` says where a figure came from and when, or what failed, in the brand's voice [APL-8]. |
| Platform owns | Reduce Motion [APL-24] and how VoiceOver delivers announcements [APL-19]. |
| Not confirmed | The disclosure control API: the Disclosure controls page is not in the registry. How VoiceOver hears whether the steps are shown: no trait in the registry covers it. |

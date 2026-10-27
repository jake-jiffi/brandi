# OnboardingChecklist on macOS

OnboardingChecklist lists first-run tasks someone can do in any order on macOS, with no native control in the registry.

```yaml
component: OnboardingChecklist
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. A list of tasks [APL-14] in the content, with progress in words. |
| Target and spacing | Each task's action meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Task names in Body 13 pt, progress in Callout, 12 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Done tasks have a check, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Not started and done, for each task, said in words [APL-1]. Finished tasks can be revisited. |
| Motion | Ticking a task fades under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each task reads its name and state [APL-19]. Progress in words: "2 of 5 done" [APL-19]. |
| Navigation placement | In the window's content on first run, never as an alert at launch [APL-13]. Apple suggests a welcome or onboarding screen for brand content at the start [APL-8]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each task [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Tasks, order and wording. Apple suggests a welcome or onboarding screen at the start, not a launch screen [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | Apple's onboarding guidance, which the Branding page points to and the registry lacks. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |

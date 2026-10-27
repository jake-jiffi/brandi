# AskBar on Android

On Android, AskBar is a Material search bar on Home that searches records, people and actions, or asks the assistant.

```yaml
component: AskBar
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-2
    url: https://m3.material.io/blog/whats-new-at-io26
    marker: posted 2026-05-19
    read: 2026-10-27
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-2
    url: https://developer.android.com/develop/ui/compose/accessibility/semantics
    marker: updated 2026-10-22
    read: 2026-10-27
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-6
    url: https://developer.android.com/reference/android/animation/ValueAnimator
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-9
    url: https://developer.android.com/jetpack/androidx/releases/compose-material3
    marker: updated 2026-10-21
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Material search, which lets people enter a keyword or phrase to get relevant information [MAT-4]: Compose `SearchBar` with `SearchBarDefaults.InputField`, which takes `keyboardOptions` and `lineLimits` [AND-9]. Material's expressive search offers a contained style with a persistent filled container [MAT-2]. |
| Target and spacing | The field and the Ask button keep at least 48 × 48 dp [MAT-7] [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Empty, typing and asking, by the product's rule. The field takes Material's text field states [MAT-9]. |
| Motion | The search bar animates its content as it expands and collapses, with specs Compose exposes [AND-9]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The field is named by its label, "Search or ask" [AND-1]. The Ask button is `Role.Button` [AND-1]. A new answer takes focus once it arrives, by the product's rule. |
| Navigation placement | One per product, on Home, by the product's rule. Material also offers a search app bar [MAT-2]. |
| Keyboard, pointer, trackpad | Cmd or Ctrl K focuses the field from a hardware keyboard. The Android API for that shortcut is not confirmed. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Placeholder "Search or ask" by default, saying on Home what can be found in the product's words, and the action "Ask". Everywhere else the same thing opens from the rail's search or the palette. Once there are answers, the AskBar and the answers share one column no wider than 880 px in the web build, not converted here. Material's search opens an expanded view [AND-9]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the Android API for the focus shortcut. |

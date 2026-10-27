# Timeline on Android

On Android, Timeline is what happened to a record, newest first, as lines with an icon by kind and a time.

```yaml
component: Timeline
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-8
    url: https://m3.material.io/foundations/designing/color-contrast
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
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
    marker: data 38.2.9
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
| Native control | None. Material 3 has no timeline component [MAT-4]. The closest pattern is a non-interactive list [MAT-20], a list item variant Compose Material 3 added in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | None. It is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Icons by kind, with the assistant's actions in the `ai` tone so people can tell them apart, by the product's rule. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Each line is one node: who did what, and when [AND-2]. Icons take `contentDescription = null` [AND-1]. `collectionInfo` gives the count [AND-2]. |
| Navigation placement | In a record's detail, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. Its lines hold no controls unless one links. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Newest first, with each line naming who did what ("[Name] approved 14 [records]") and the assistant's actions in the `ai` tone. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Nothing: the sources settle every field. |

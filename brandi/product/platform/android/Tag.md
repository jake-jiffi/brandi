# Tag on Android

On Android, Tag is an outlined label with its category's colour dot, read as a category and never a status, with an optional remove button.

```yaml
component: Tag
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-5
    url: https://m3.material.io/components/buttons/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-6
    url: https://m3.material.io/components/buttons/accessibility
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
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
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
| Native control | None for a read-only tag, since Material has no tag component [MAT-4]. With a remove button, the closest is a Material input chip, Compose `InputChip` [MAT-4] [AND-9]. |
| Target and spacing | The remove button keeps the 48 dp minimum of `IconButton` [AND-1] [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | The category's colour dot, matching its chart series, with grey for unknown. The label and outline carry the meaning, not the dot, by the product's rule. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | None for the tag itself. The remove button takes focused, hovered and pressed states [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The tag reads as text. The remove button is `Role.Button`, named "Remove [tag]" [AND-1]. |
| Navigation placement | On a record's row or detail, by the product's rule. Material's chips help people enter information [MAT-4]. |
| Keyboard, pointer, trackpad | The remove button takes Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | A category keeps its colour everywhere. Status is a Badge, never a Tag. Tinted fills, if used, stay visibly different from Badge tints. The remove button's 24 px hit area in the web build is not converted here. Material asks 48 × 48 dp [MAT-7]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Nothing: the sources settle every field. |

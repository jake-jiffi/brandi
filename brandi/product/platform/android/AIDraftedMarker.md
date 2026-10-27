# AIDraftedMarker on Android

On Android, AIDraftedMarker is one line on a draft saying who asked for it and how the brand check went, read with the draft as its description.

```yaml
component: AIDraftedMarker
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a Material component [MAT-4]. A line of text merged into the draft's node, with a link when the check found issues [AND-2]. |
| Target and spacing | The issues link keeps at least 48 × 48 dp on touch [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Passed, issues, checking, not checked and edited, by the product's rule. The issues link takes focused, hovered and pressed states [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Plain text read with the draft, merged into its node [AND-2], and never a live region. The issues link is the only focusable part. The role Android gives it is not confirmed. |
| Navigation placement | On the draft itself, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Only the issues link takes focus [MAT-9]. The key that activates a link on Android is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | "Drafted with AI by [name], brand check passed", where [name] is the person who asked. An auto-draft names what started it instead. Editing runs the check again. Unproven: no review round has checked it. Material sets nothing for it [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Accessibility API: the role Android gives the issues link. Keyboard, pointer, trackpad: the key that activates a link. |

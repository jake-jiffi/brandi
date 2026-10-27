# Sheet on Android

On Android, Sheet is a panel for a record or a longer edit without leaving the list: a Material side sheet on wide windows and a bottom sheet on compact ones.

```yaml
component: Sheet
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-15
    url: https://m3.material.io/components/bottom-sheets/overview
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
| Native control | Material side sheets show secondary content anchored to the side of the screen [MAT-4]. A Compose side sheet API is not confirmed. At compact and medium widths Material uses bottom sheets [MAT-15]: Compose `ModalBottomSheet`, with `rememberBottomSheetState` as the unified state API from the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | The bottom sheet's optional drag handle has an accessible 48 dp target [MAT-15]. Buttons keep the 48 dp minimum [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title takes `heading()` [AND-2]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Bottom sheets take 28 dp top corners [MAT-15]. |
| States | Open or closed. A sheet takes no hover, focus, press or disabled state as a whole [MAT-9]. |
| Motion | Android 14 added predictive back animations for Material's bottom sheets and side sheets [AND-5]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | A window-like component similar to `ModalBottomSheet` takes `paneTitle` semantics [AND-2]. The title is a heading [AND-2]. Focus moves in and stays, then returns to the row that opened it, by the product's rule. |
| Navigation placement | Bottom sheets at compact and medium widths, up to 640 dp wide [MAT-15]. Side sheets anchor to the side of the screen [MAT-4]. At expanded and large widths, list and detail as two panes is recommended instead [MAT-10]. |
| Keyboard, pointer, trackpad | The product's Escape and scrim close it and return focus to the row that opened it. How Escape reaches a Compose sheet is not confirmed. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | A panel from the right, inset from the edges like the rail, 440 px wide in the web build, not converted here. On wide screens the detail pane sits beside the list instead. The product's switch point is CSS px and is not converted here, while Material recommends two panes at expanded and large widths [MAT-10]. A sheet may open a confirmation dialog. |
| Platform owns | Predictive back on sheets [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Native control: a Compose side sheet API. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: how Escape reaches a Compose sheet. |

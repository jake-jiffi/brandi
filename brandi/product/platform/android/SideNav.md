# SideNav on Android

On Android, SideNav is in-page navigation for settings and long documents, a list beside the content on wide windows and its own screen on compact ones.

```yaml
component: SideNav
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-21
    url: https://m3.material.io/components/lists/accessibility
    marker: snapshot 2026-10-13_06-10-19
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
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no in-page navigation component [MAT-4]. The closest pattern is a list in a list-detail layout [MAT-20] [MAT-10], which Navigation 3's `ListDetailSceneStrategy` builds [AND-8]. |
| Target and spacing | Each item at least 48 × 48 dp [MAT-20]. |
| Type | Items in body large, 16 on 24, as list labels [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | The current item takes `selected-strong` and a ring, by the product's rule. A selected Material list item takes `secondary container` [MAT-20]. |
| States | Current or not, by the product's rule. List items take hovered, focused and pressed states [MAT-20]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Items read as a list, with `collectionInfo` giving the count [AND-2]. The current item exposes its state. Which semantics property marks it is not confirmed. |
| Navigation placement | Beside a settings page's sections, sticky, by the product's rule. Material calls settings with low-density content a good use of two panes at medium widths, and recommends one pane at compact widths [MAT-10]. |
| Keyboard, pointer, trackpad | Tab lands on the first or the selected item, the arrows move and wrap, and Space or Enter activates [MAT-21]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Items link to their sections. Nothing is current until `value` is set. The current item takes `selected-strong` and a ring. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | The list key map [MAT-21]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the semantics property that marks the current item. |

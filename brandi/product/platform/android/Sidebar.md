# Sidebar on Android

On Android, Sidebar is the rail: a Material navigation rail holding the product lockup, search or ask, the navigation groups and the signed-in person.

```yaml
component: Sidebar
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-12
    url: https://m3.material.io/components/navigation-rail/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-13
    url: https://m3.material.io/components/navigation-drawer/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
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
| Native control | Material navigation rail, collapsed or expanded, with the expanded rail replacing the navigation drawer [MAT-12] [MAT-13]: Compose `WideNavigationRail`, or `ModalWideNavigationRail` for the modal form, with `WideNavigationRailItem` [AND-9]. |
| Target and spacing | Each destination and the account button keep at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Only the product's `rail-*` tokens and the highlight count live on the rail, by the product's rule. Material's rail draws the active label on vertical items in `secondary` [MAT-12]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Collapsed or expanded. Expanded can be modal or not, and can collapse to the rail or hide [MAT-12]. |
| Motion | Collapsed and expanded rails transition into each other on any device [MAT-12], on the default spatial spring Material names for the expanded rail [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Collapsed, the labels stay for TalkBack as content descriptions and show as tooltips on hover and focus [AND-1]. The account button is named "[name], [role], account menu" [AND-1]. The product's `nav` landmark named "Main" is web structure, Material's landmark guidance is for the web only [MAT-7], and the Android equivalent is not confirmed. |
| Navigation placement | The leading edge, in the same place on every screen, from medium widths up [MAT-12]. 3 to 7 destinations plus an optional FAB [MAT-12]. The most frequent destinations at the top, with related ones grouped [MAT-13]. |
| Keyboard, pointer, trackpad | The modal rail closes with Escape and keeps focus as it collapses, since the 1.5.0 pre-releases [AND-9]. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. Cmd or Ctrl K opens search from a hardware keyboard. The Android API for that shortcut is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Eight top-level items at most, in groups under short uppercase labels, with settings and help in the footer. Material's rail holds 3 to 7 destinations [MAT-12]. Whether the rail carries the brand is a brand-to-product decision, and without one it is a quiet surface. Icons only from 1024 to 1279 px in the web build, not converted here. Focus on the rail uses `rail-focus`. |
| Platform owns | Predictive back on the rail [MAT-12]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: an Android equivalent of the `nav` landmark. Keyboard, pointer, trackpad: the Android API for the search shortcut. |

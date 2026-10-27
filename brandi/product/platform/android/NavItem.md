# NavItem on Android

On Android, NavItem is one destination on the rail or the navigation bar: an icon, a label and an optional count.

```yaml
component: NavItem
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
  - key: MAT-11
    url: https://m3.material.io/components/navigation-bar/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-12
    url: https://m3.material.io/components/navigation-rail/overview
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
| Native control | A Material navigation rail or navigation bar item [MAT-11] [MAT-12]: Compose `WideNavigationRailItem` or `NavigationBarItem` [AND-9]. Material marks the active destination with a pill-shaped indicator [MAT-11] [MAT-12]. Counts use a Material badge, Compose `Badge` in a `BadgedBox` [MAT-4] [AND-9]. |
| Target and spacing | At least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text style for navigation labels is not confirmed. |
| Colour and theme | The active label is `secondary` [MAT-11] [MAT-12] [AND-9]. The current page takes `rail-selected` with a hairline, by the product's rule. |
| States | Current, and a count that takes the highlight with `attention`, grey without, and nothing at zero, by the product's rule. Material marks the active destination with a pill-shaped indicator in a contrasting colour [MAT-11] [MAT-12]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The label and the count read together as words: "Approvals, 3 need you" [AND-1]. The current destination exposes its selected state. Which semantics property Compose's navigation items use for it is not confirmed. |
| Navigation placement | On the rail or the navigation bar [MAT-11] [MAT-12]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. A cursor shows the hover state layer, one element at a time [MAT-9]. Activation keys for navigation items are not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Counts mean work: a highlight count is waiting on the reader, a grey count on someone else, and zero shows nothing. The count's text is `on-highlight`, solved for contrast. `sub` nests an item. Material's badges carry counts on navigation items [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The 48 dp touch target [MAT-7]. |
| Not confirmed | Type: Material's text style for navigation labels. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the semantics property for the current destination. Keyboard, pointer, trackpad: activation keys for navigation items. |

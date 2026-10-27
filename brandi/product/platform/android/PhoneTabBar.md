# PhoneTabBar on Android

On Android, PhoneTabBar is a Material navigation bar, three to five top-level places at the foot of a phone app.

```yaml
component: PhoneTabBar
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
  - key: MAT-11
    url: https://m3.material.io/components/navigation-bar/overview
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
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
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
| Native control | Material navigation bar, the flexible bar that replaced the baseline one [MAT-11]: Compose `ShortNavigationBar`, or `NavigationBar` with `NavigationBarItem` [AND-9]. `NavigationSuiteScaffold` swaps it for a rail on large screens [AND-8]. |
| Target and spacing | Each destination at least 48 × 48 dp, with 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text style for navigation labels is not confirmed. |
| Colour and theme | The active label is `secondary`, with a pill-shaped indicator in a contrasting colour [MAT-11] [AND-9]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | The current place, and counts that show nothing at zero, by the product's rule. A navigation bar takes no hover, focus, press or disabled state as a whole [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each destination reads its label and its count as words [AND-1], with its selected state. The semantics property for the current place is not confirmed. |
| Navigation placement | At the foot of the screen at compact and medium widths, with 3 to 5 destinations of equal importance that stay the same on every screen [MAT-11]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. Activation keys for navigation items are not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Three to five places, with counts read as words and nothing shown at zero. 40 px at least, 44 px by default and 8 px between targets in the web build, not converted here. Material asks 48 × 48 dp [MAT-7]. The product puts a screen's primary action in a bar at the foot, which competes for the same place, so each product decides which one owns it. Unproven: no review round has checked it. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The swap to a rail on large screens [AND-8]. |
| Not confirmed | Type: Material's text style for navigation labels. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the semantics property for the current place. Keyboard, pointer, trackpad: activation keys for navigation items. |

# Root on Android

On Android, Root is the app's `MaterialTheme`, the one place that sets colour, type and motion for everything inside it.

```yaml
component: Root
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-3
    url: https://m3.material.io/blog/material-is-compose-first
    marker: posted 2026-05-19
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
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-19
    url: https://m3.material.io/styles/color/dynamic/choosing-a-source
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
  - key: AND-7
    url: https://developer.android.com/reference/android/app/UiModeManager
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
| Native control | Compose `MaterialTheme`, which carries the `ColorScheme`, the `Typography` and the motion scheme every Material component reads [AND-9]. In the 1.5.0 pre-releases `Typography` can take one default font family for every style [AND-9]. Build in Compose: Material Views 1.14.0 is the final stable Views release and is in maintenance [MAT-3]. |
| Target and spacing | None. Root draws no control. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Root sets the base type: the brand and the plain typeface, with Roboto the default for both [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The type scale adapts line height to the language's height category, from small to extra large, and medium suits most languages [MAT-16]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. An app can set and persist its own night mode with `UiModeManager.setApplicationNightMode()`, from API 31 [AND-7]. Material can generate the whole scheme from the wallpaper or from in-app content [MAT-19]. The rules for opting out in favour of a fixed brand scheme are not confirmed. |
| States | None. Root has no interaction states. Material's states are for interactive components [MAT-9]. |
| Motion | `MaterialTheme.motionScheme` sets the springs every Material component uses: expressive, standard or a custom scheme, which can be swapped per element [AND-9] [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | No node of its own. A composable with no semantics properties stays out of the semantics tree, so TalkBack never lands on Root [AND-2]. |
| Navigation placement | Root sits at the top of the composition, the tree of composables that describes the UI [AND-2], rather than anywhere on screen. A nested Root may flip one region, by the product's rule. |
| Keyboard, pointer, trackpad | No keyboard behaviour of its own. Root holds the product's switch for single-key shortcuts. The Android API that receives hardware key shortcuts is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The product's guidelines set the theme: light by default, dark as a full theme people choose, never a per-screen switch, and one theme per screen. Its role colours replace Material's baseline scheme and dynamic colour [MAT-18] [MAT-19], and its typefaces replace Roboto [MAT-16]. Products offer the single-key shortcut switch in their own settings, for speech-input and switch users. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. The contrast level the person picks, delivered through the colour roles [MAT-18]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. Apps targeting API 37 cannot opt out of resizing and orientation changes on large screens [AND-8]. |
| Not confirmed | Colour and theme: the rules for opting out of dynamic colour in favour of a fixed brand scheme. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the Android API that receives hardware key shortcuts. |

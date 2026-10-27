# PlanPicker on Android

On Android, PlanPicker is one plan chosen from two to five, shown as cards that say what each includes.

```yaml
component: PlanPicker
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
  - key: MAT-21
    url: https://m3.material.io/components/lists/accessibility
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a Material component [MAT-4]. Material cards [MAT-4] that behave as one single-select group, each taking role Radio button with a checked state, as Material specifies for single-select list items in Compose [MAT-21]. |
| Target and spacing | Each card is one target of at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Prices use the formatter's `currency` style, by the product's rule. |
| Colour and theme | The chosen plan shows with two cues, such as a check and a fill [MAT-21]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Chosen or not, with the safest one preselected, by the product's rule. Cards take hovered, focused and pressed states [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each card reads its plan, its price and what it includes as one merged node [AND-2], with a checked or not-checked state [MAT-21]. `collectionItemInfo` gives each plan's place [AND-2]. |
| Navigation placement | Side by side on wide windows and stacked on compact ones, by the product's rule. Material resizes and repositions cards as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | In Material's single-select lists, Tab lands on the selected item and the arrows move [MAT-21]. The keys for a group of cards are not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Two to five options, seen side by side, with the safest preselected. More than five is a Select. Prices in the `currency` style. Unproven: no review round has checked it. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the keys for a group of cards. |

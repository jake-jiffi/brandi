# MetricCard on Android

On Android, MetricCard is a Material card with one headline figure, its delta and comparison, an optional trend and a footnote.

```yaml
component: MetricCard
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
| Native control | None as a Material component [MAT-4]. Build it on a Material card [MAT-4], with a Delta, a Sparkline and an info `IconButton` for the hint [AND-9]. |
| Target and spacing | The hint's info button keeps the 48 dp minimum [AND-1]. |
| Type | The figure in a large display or headline style. Nonlinear scaling grows large text less than small text [AND-5]. Roboto by default [MAT-16]. Tabular figures, by the product's rule. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The delta's colour gives the judgement and its arrow the direction. |
| States | Ready, loading (a skeleton) and unavailable (with when the source last answered), by the product's rule. The hint button takes focused, hovered and pressed states [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Label, value and delta read together as one node [AND-2]: "[Label], $18K, up 6.2%, better vs last month". The hint button is `Role.Button` [AND-1], and its text is read when it opens, through a polite live region [AND-2]. Unavailable says so, never a zero nobody measured. |
| Navigation placement | In a row of metric cards at the top of a dashboard, one `hero` per row at most, by the product's rule. Material resizes cards as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | The hint button takes Tab, then Space or Enter, and opens the hint [MAT-6]. Escape closes it, by the product's rule. How Escape reaches a Compose popup is not confirmed. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The label says exactly what is counted, and the footnote or hint what is left out. Rounded on cards ($18K), exact in tables. The figure shrinks with its card, not the window. The web build's thresholds are CSS px and are not converted here. Material sets nothing for metrics [MAT-4]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: how Escape reaches a Compose popup. |

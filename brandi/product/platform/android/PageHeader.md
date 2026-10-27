# PageHeader on Android

On Android, PageHeader is the top of a page: a Material top app bar with the title and actions, and the product's description, badges and tabs below it.

```yaml
component: PageHeader
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
| Native control | Material app bars, placed at the top of the screen [MAT-4]: Compose `TopAppBar`, `MediumFlexibleTopAppBar` or `LargeFlexibleTopAppBar`, all out of experimental status in the 1.5.0 pre-releases [AND-9]. The scroll behaviours `pinnedScrollBehavior` and `enterAlwaysScrollBehavior` take a `ScrollableState` [AND-9]. |
| Target and spacing | Actions keep the 48 dp minimum [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title wraps rather than overflowing, by the product's rule. Compose constrains a `TopAppBar` title to its space since a 1.5.0 pre-release fix [AND-9]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | An app bar takes no hover, focus, press or drag state as a whole. The actions inside it do [MAT-9]. |
| Motion | The app bar can collapse or stay pinned as content scrolls [AND-9]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Its title takes `Modifier.semantics { heading() }`, so TalkBack can jump between headings [AND-2]. Actions are `Role.Button`, each with its own name [AND-1]. |
| Navigation placement | The top of the screen [MAT-4]. On phones the actions drop below the title, and inside AppShell the primary moves to the bar at the foot, by the product's rule. |
| Keyboard, pointer, trackpad | Actions take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | One title per screen, the noun people use ("Clients"), never "Dashboard". One primary at most, on the right. Breadcrumbs above, badges beside the title, a description capped at the measure, and Tabs underneath. Material's app bar holds the title and actions in one bar [MAT-4]. The product adds the rest below it. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |

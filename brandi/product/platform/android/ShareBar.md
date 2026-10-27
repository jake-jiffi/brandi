# ShareBar on Android

On Android, ShareBar shows shares of a whole as one segmented bar with a legend that prints every share, in place of pie and donut charts.

```yaml
component: ShareBar
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
  - key: MAT-8
    url: https://m3.material.io/foundations/designing/color-contrast
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
  - key: AND-7
    url: https://developer.android.com/reference/android/app/UiModeManager
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no chart component [MAT-4]. A chart is a custom composable drawn on a canvas, so it adds its own semantics. Without them TalkBack hears only the container, as Android's calendar example shows [AND-2]. |
| Target and spacing | None. It is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Legend text in sp, scaled nonlinearly up to 200% [AND-5]. Roboto by default [MAT-16]. |
| Colour and theme | Series colours keep at least 3:1 against the surface, as Material asks of graphics [MAT-8]. A chart draws its own colours, so it reads `UiModeManager.getContrast()`, from API 34, to follow the person's contrast level [AND-7]. Neighbouring segments that collapse under a colour-vision deficiency are labelled directly or reordered, by the product's rule. |
| States | Empty, by the product's rule, with zero and negative values left out. It is not interactive, so Material's interaction states do not apply [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The chart's node is named by its title and summary [AND-1]. The legend prints every share as text, so TalkBack reads each label with its share [AND-1]. |
| Navigation placement | On a surface, inside a ChartFigure or a Card, by the product's rule. Material resizes content with its pane as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | None. The legend is text. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | It replaces pie and donut charts, which the system does not use. `data`, `format` and `empty`, with zero and negative values left out. Material sets nothing for charts [MAT-4]. |
| Platform owns | The person's contrast level, which a custom drawing reads for itself [AND-7]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Nothing: the sources settle every field. |

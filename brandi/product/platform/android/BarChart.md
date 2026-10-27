# BarChart on Android

On Android, BarChart is a custom chart of amounts across categories or days, grouped or stacked, drawn on a canvas with semantics of its own.

```yaml
component: BarChart
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
| Target and spacing | The plot takes focus as one target of at least 48 × 48 dp [MAT-7]. |
| Type | Axis text, the legend and direct labels in sp, scaled nonlinearly up to 200% [AND-5]. Roboto by default [MAT-16]. |
| Colour and theme | Series colours keep at least 3:1 against the surface, as Material asks of graphics [MAT-8]. A chart draws its own colours, so it reads `UiModeManager.getContrast()`, from API 34, to follow the person's contrast level [AND-7]. Series run `series-1` to `series-6` in that order, never by rank. Comparisons are grey and dashed. Status colours stay for status, by the product's rule. |
| States | Loading (a skeleton the chart's size), error and empty, by the product's rule. Missing data is a gap, never zero. Focus on the plot shows Material's ring-like indicator [MAT-9]. |
| Motion | None. The product's charts draw in place. Remove animations changes nothing [AND-10]. |
| Accessibility API | The chart's node is named by its title and summary, the takeaway in words [AND-1]. A canvas drawing needs its points' semantics added by hand [AND-2], with `collectionInfo` and `collectionItemInfo` giving their count and place [AND-2]. The point in hand is announced through a polite live region [AND-2]. An Android equivalent of the web build's hidden data table is not confirmed. |
| Navigation placement | On a surface, inside a ChartFigure or a Card, because the series colours are checked at 3:1 against it, by the product's rule. Material resizes content with its pane as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | The product's map: the plot takes focus, and Left and Right, with Home and End for the ends, move through the points, show the point's tooltip and announce it. Key handling for a custom composable on Android is not confirmed. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | None. The product plays no haptic on charts, and on Android less is more with haptics [AND-3]. |
| Brand may change | Stack only when the parts make a whole. Bars up to 26 px wide, with 4 px rounded data ends and 2 px gaps between stacked parts in the web build, not converted here. `auto` labels name two to four stacked series beside the last bar. One y-axis, never two, and never a pie or donut. Material sets nothing for charts [MAT-4]. |
| Platform owns | The person's contrast level, which a custom drawing reads for itself [AND-7]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Accessibility API: an Android equivalent of the web build's hidden data table. Keyboard, pointer, trackpad: key handling for a custom composable. |
